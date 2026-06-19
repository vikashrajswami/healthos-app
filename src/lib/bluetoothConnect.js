// Web Bluetooth API — connects to any open BLE GATT device
// Works in Chrome (Android + Desktop). Not supported in Safari or Firefox.

export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}

// ── Scan — opens native browser device picker ─────────────────────────────────
export async function scanForDevice() {
  if (!isBluetoothSupported()) {
    throw new Error('USE_CHROME')
  }
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      { services: ['heart_rate'] },
      { services: ['weight_scale'] },
      { services: ['blood_pressure'] },
      { services: ['body_composition'] },
    ],
    optionalServices: [
      'heart_rate', 'weight_scale', 'blood_pressure',
      'body_composition', 'battery_service',
    ],
  })
  return device  // has .name and .gatt
}

// ── Connect to GATT server and detect device type ─────────────────────────────
export async function connectDevice(device) {
  const server   = await device.gatt.connect()
  const services = await server.getPrimaryServices()
  const uuids    = new Set(services.map(s => s.uuid))

  let type = 'hrm'
  if (uuids.has('00001810-0000-1000-8000-00805f9b34fb')) type = 'bp'
  else if (uuids.has('0000181b-0000-1000-8000-00805f9b34fb')) type = 'scale_body'
  else if (uuids.has('0000181d-0000-1000-8000-00805f9b34fb')) type = 'scale'

  const battery = await readBattery(server)
  return { server, type, battery }
}

// ── Heart Rate Monitor — streams HR + HRV in real time ───────────────────────
// onData({ hr, hrv, rr }) called every ~1 second
export async function startHRM(server, onData) {
  const svc  = await server.getPrimaryService('heart_rate')
  const char = await svc.getCharacteristic('heart_rate_measurement')
  const rrs  = []   // ring buffer of RR intervals for RMSSD

  char.addEventListener('characteristicvaluechanged', e => {
    const { hr, rrIntervals } = parseHRM(e.target.value)
    rrs.push(...rrIntervals)
    if (rrs.length > 30) rrs.splice(0, rrs.length - 30)
    const hrv = rrs.length >= 4 ? calcRMSSD(rrs) : null
    onData({ hr, hrv, rr: rrIntervals })
  })

  await char.startNotifications()
  return char  // caller can call char.stopNotifications() to disconnect
}

// ── Weight Scale ──────────────────────────────────────────────────────────────
export async function readScale(server) {
  const svc  = await server.getPrimaryService('weight_scale')
  const char = await svc.getCharacteristic('weight_measurement')
  return notifyOnce(char, parseScale, 15000)
}

// ── Body Composition Scale ────────────────────────────────────────────────────
export async function readBodyComposition(server) {
  const svc  = await server.getPrimaryService('body_composition')
  const char = await svc.getCharacteristic('body_composition_measurement')
  return notifyOnce(char, parseBodyComp, 15000)
}

// ── Blood Pressure Monitor ────────────────────────────────────────────────────
export async function readBP(server) {
  const svc  = await server.getPrimaryService('blood_pressure')
  const char = await svc.getCharacteristic('blood_pressure_measurement')
  return notifyOnce(char, parseBP, 30000)
}

// ── Battery ───────────────────────────────────────────────────────────────────
async function readBattery(server) {
  try {
    const svc  = await server.getPrimaryService('battery_service')
    const char = await svc.getCharacteristic('battery_level')
    const val  = await char.readValue()
    return val.getUint8(0)
  } catch { return null }
}

// ── Parsers ───────────────────────────────────────────────────────────────────
function parseHRM(dv) {
  const flags    = dv.getUint8(0)
  const wide     = flags & 0x1
  const hasEnergy = (flags >> 3) & 0x1
  const hasRR    = (flags >> 4) & 0x1
  let off        = 1
  const hr       = wide ? dv.getUint16(off, true) : dv.getUint8(off)
  off += wide ? 2 : 1
  if (hasEnergy) off += 2
  const rrIntervals = []
  while (hasRR && off + 1 < dv.byteLength) {
    rrIntervals.push(dv.getUint16(off, true) / 1024 * 1000)  // → ms
    off += 2
  }
  return { hr, rrIntervals }
}

function parseScale(dv) {
  const imperial = dv.getUint8(0) & 0x1
  const raw      = dv.getUint16(1, true)
  const kg       = imperial ? raw * 0.01 * 0.453592 : raw * 0.005
  return { weight: +kg.toFixed(1) }
}

function parseBodyComp(dv) {
  const raw     = dv.getUint16(2, true)
  const bodyFat = +(raw * 0.1).toFixed(1)
  return { bodyFat }
}

function parseBP(dv) {
  const kPa      = dv.getUint8(0) & 0x1
  const mul      = kPa ? 7.500617 : 1
  const sys      = Math.round(dv.getUint16(1, true) * mul)
  const dia      = Math.round(dv.getUint16(3, true) * mul)
  const hasPulse = (dv.getUint8(0) >> 2) & 0x1
  const pulse    = hasPulse ? dv.getUint16(7, true) : null
  return { systolic: sys, diastolic: dia, pulse }
}

// ── RMSSD (HRV) from RR intervals ────────────────────────────────────────────
function calcRMSSD(rrs) {
  if (rrs.length < 2) return null
  const sq = []
  for (let i = 1; i < rrs.length; i++) sq.push((rrs[i] - rrs[i - 1]) ** 2)
  return Math.round(Math.sqrt(sq.reduce((a, b) => a + b, 0) / sq.length))
}

// ── Wait for one notification then resolve ────────────────────────────────────
function notifyOnce(char, parser, timeoutMs) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      char.stopNotifications().catch(() => {})
      reject(new Error('Device timeout — try again'))
    }, timeoutMs)
    char.addEventListener('characteristicvaluechanged', e => {
      clearTimeout(t)
      char.stopNotifications().catch(() => {})
      resolve(parser(e.target.value))
    })
    char.startNotifications().catch(reject)
  })
}

// ── Detect device category from BLE name ──────────────────────────────────────
export function detectCategory(name = '') {
  const n = name.toLowerCase()
  if (n.includes('polar') || n.includes('wahoo') || n.includes('tickr') ||
      n.includes('h10') || n.includes('h9') || n.includes('hrm') ||
      n.includes('heart')) return 'hrm'
  if (n.includes('bp') || n.includes('blood') || n.includes('omron') ||
      n.includes('pressure')) return 'bp'
  if (n.includes('scale') || n.includes('withings') || n.includes('body+') ||
      n.includes('mi scale') || n.includes('weight')) return 'scale'
  return 'hrm'
}

// ── localStorage helpers ──────────────────────────────────────────────────────
export function getBLEDevices() {
  try { return JSON.parse(localStorage.getItem('healthos_ble_devices') || '{}') }
  catch { return {} }
}

export function saveBLEDevice(name, category, data) {
  const all = getBLEDevices()
  all[name] = { name, category, data, _ts: Date.now() }
  localStorage.setItem('healthos_ble_devices', JSON.stringify(all))
}

export function removeBLEDevice(name) {
  const all = getBLEDevices()
  delete all[name]
  localStorage.setItem('healthos_ble_devices', JSON.stringify(all))
}
