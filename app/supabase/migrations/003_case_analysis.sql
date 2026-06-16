-- Stage 4: store AI analysis result on the case

alter table cases
  add column if not exists analysis_summary text,
  add column if not exists error_reason text;
