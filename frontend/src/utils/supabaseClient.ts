import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ahalejbbqweeodjhfcyo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoYWxlamJicXdlZW9kamhmY3lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NzMzOTUsImV4cCI6MjA2NDM0OTM5NX0.xW925nyy9cZN2tJGE7m2UY16ed3SO7lylRDPBPyOv_o'

export const supabase = createClient(supabaseUrl, supabaseKey)
