import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export async function saveReport({ fileName, biomarkers, reportDate, labName, summary, userId = 'demo' }) {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id:     userId,
      file_name:   fileName,
      report_date: reportDate,
      lab_name:    labName,
      summary,
      biomarkers,       // stored as jsonb
      created_at:  new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLatestBiomarkers(userId = 'demo') {
  const { data, error } = await supabase
    .from('reports')
    .select('biomarkers, report_date, lab_name, file_name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}
