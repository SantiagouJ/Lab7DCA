import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://upugjyihuahxisfmpxzq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwdWdqeWlodWFoeGlzZm1weHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjg5ODUsImV4cCI6MjA2NDkwNDk4NX0.FNQDHz5jYK5UnfUH6pikeiaU5V-Q-krnsyTg22JZddU";

export const supabase = createClient(supabaseUrl, supabaseKey);

supabase.storage.listBuckets().then(({ data, error }) => {
  console.log('Buckets visibles desde el código:', data, 'Error:', error);
});