export type Language = 'English' | 'Hinglish' | 'Hindi' | 'Spanish';

export interface Citation {
  tag: string;
  source_name: string;
  source_type: 'video' | 'pdf' | 'slides';
  timestamp_str?: string | null;
  start_seconds?: number | null;
  page?: number | null;
  slide_number?: number | null;
  video_url?: string | null;
  snippet?: string;
}

export interface RetrievedChunk {
  id: string;
  source_name: string;
  source_type: 'video' | 'pdf' | 'slides';
  page?: number | null;
  timestamp_str?: string | null;
  start_seconds?: number | null;
  end_seconds?: number | null;
  video_url?: string | null;
  text: string;
  citation_tag: string;
  similarity_score?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  isOffMaterial?: boolean;
  language?: Language;
  citations?: Citation[];
  suggestedFollowups?: string[];
  timestamp: string;
}

export interface SourceSummary {
  source_name: string;
  source_type: 'video' | 'pdf' | 'slides';
  chunk_count: number;
  video_url?: string | null;
  max_page?: number;
  duration_seconds?: number;
  sample_citations?: string[];
}

export type QuestionType = 'mcq' | 'multi_mcq' | 'short_answer' | 'numerical';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correct_index?: number;
  correct_indices?: number[];
  rubric_points?: string[];
  sample_answer?: string;
  correct_value?: number;
  tolerance?: number;
  unit?: string;
  calculation_steps?: string;
  concept: string;
  citation: string;
  difficulty: string;
  explanation: string;
  exam_tag?: string;
  subject?: string;
  chapter?: string;
  marks_correct?: number;
  marks_incorrect?: number;
  hint?: string;
  formula_used?: string;
  user_answer?: any;
  is_bookmarked?: boolean;
  is_correct?: boolean;
  marks_awarded?: number;
}

export interface ExamChapter {
  name: string;
  weightage: 'High' | 'Medium' | 'Moderate' | string;
  pyq_count: number;
  difficulty: string;
}

export interface ExamSubject {
  name: string;
  icon?: string;
  chapters: ExamChapter[];
}

export interface ExamCurriculum {
  title: string;
  description: string;
  subjects: ExamSubject[];
}

export interface TestScorecard {
  target_exam: string;
  test_title: string;
  mode: 'practice' | 'cbt';
  total_time_seconds: number;
  total_questions: number;
  max_marks: number;
  marks_obtained: number;
  accuracy_pct: number;
  score_pct: number;
  percentile_estimate: number;
  correct_count: number;
  incorrect_count: number;
  unattempted_count: number;
  chapter_stats: Record<string, {
    total: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    score: number;
  }>;
  evaluated_questions: QuizQuestion[];
}

export interface BKTUpdate {
  concept: string;
  prior_mastery: number;
  new_mastery: number;
  delta: number;
  status: string;
}

export interface QuizGradingResult {
  is_correct: boolean;
  feedback: string;
  explanation?: string;
  citation: string;
  concept: string;
  score_percentage?: number;
  correct_value?: number;
  user_value?: number;
  bkt_mastery?: BKTUpdate;
  remedial_question?: QuizQuestion | null;
}

export interface BKTConcept {
  concept: string;
  mastery_probability: number;
  mastery_percentage: number;
  retrievability: number;
  status: 'Mastered' | 'In Progress' | 'Knowledge Gap';
  attempts: number;
  correct: number;
  last_active: string;
}

export interface LearnerProfile {
  student_name: string;
  diagnostic_completed: boolean;
  average_mastery_pct: number;
  total_concepts_tracked: number;
  mastered_count: number;
  knowledge_gap_count: number;
  concepts: BKTConcept[];
  total_unique_questions_served: number;
}

export interface CourseFlowNode {
  id: string;
  topic: string;
  concept: string;
  prerequisites: string[];
  difficulty: string;
  citations: string[];
  origin_type: 'video' | 'pdf' | 'slides';
  source_name: string;
  timestamp_str?: string | null;
  page?: number | null;
  description: string;
  mastery_score: number;
  mastery_status: 'Mastered' | 'In Progress' | 'Needs Review';
  status_color: string;
  diagram?: {
    title: string;
    type: string;
    caption: string;
  };
}

export interface CourseFlowEdge {
  from: string;
  to: string;
  label: string;
}

export interface CourseFlowData {
  nodes: CourseFlowNode[];
  edges: CourseFlowEdge[];
  total_nodes: number;
  topics: string[];
}

export interface DiagramItem {
  concept: string;
  citation: string;
  origin: string;
  title: string;
  type: string;
  caption: string;
}

export interface Flashcard {
  id: string;
  concept: string;
  front: string;
  back: string;
  citation: string;
  source_type: 'video' | 'pdf' | 'slides';
}

export interface AudioBrief {
  topic: string;
  script: string;
  estimated_duration_seconds: number;
  audio_citations: string[];
}

export interface StudyScheduleItem {
  day_number: number;
  topic: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  recommended_activity: string;
  target_mastery: string;
}

export interface TestCaseResult {
  id: string;
  query: string;
  is_off_material: boolean;
  category: string;
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  context_recall: number;
  refusal_accuracy: number;
  citations_extracted: string[];
  answer_snippet: string;
}

export interface BenchmarkSummary {
  total_test_cases: number;
  in_material_tests: number;
  off_material_tests: number;
  overall_faithfulness: number;
  overall_answer_relevancy: number;
  overall_context_precision: number;
  overall_context_recall: number;
  off_material_refusal_accuracy: number;
  runtime_seconds: number;
  test_cases: TestCaseResult[];
}

export interface SessionHistory {
  session_number: number;
  accuracy_pct: number;
  average_mastery_pct: number;
  mastered_concepts_count: number;
  gaps_count: number;
}

export interface SimulatedStudent {
  persona_id: string;
  persona_name: string;
  initial_prior: number;
  final_mastery_pct: number;
  mastery_gain_pct: number;
  sessions: SessionHistory[];
}

export interface SimulationResults {
  total_students_simulated: number;
  total_questions_served: number;
  duplicate_question_count: number;
  question_repetition_rate_pct: number;
  students: SimulatedStudent[];
}

export interface GapReportItem {
  concept: string;
  missed_count: number;
  priority: 'High' | 'Medium' | 'Low';
  recommended_sources: string[];
  jump_bookmarks: Array<{
    tag: string;
    source_name: string;
    source_type: string;
    timestamp_str?: string;
    seconds?: number;
    page?: number;
  }>;
}

export interface KnowledgeGapReportData {
  total_questions: number;
  accuracy_percentage: number;
  bkt_profile?: LearnerProfile;
  summary_narrative: string;
  mastered_concepts: Array<{ concept: string; correct_count: number; status: string }>;
  knowledge_gaps: GapReportItem[];
}

export type TeachingStyle =
  | 'simple'
  | 'detailed'
  | 'step_by_step'
  | 'worked_example'
  | 'analogy'
  | 'socratic'
  | 'diagram_assisted'
  | 'exam_focused';

export interface VideoChapter {
  id?: string;
  title: string;
  start_time: number;
  duration?: number;
  visual_cue?: string;
  citation?: string;
}

export interface VideoCaption {
  start_time: number;
  end_time: number;
  text: string;
}

export interface TranscriptLine {
  time: number;
  speaker: string;
  text: string;
  citation?: string;
}

export interface VideoLesson {
  id: string;
  title: string;
  topic: string;
  style: 'animated_concept' | 'narrated_slides' | 'teacher_avatar';
  duration_seconds: number;
  chapters: VideoChapter[];
  captions: VideoCaption[];
  interactive_transcript: TranscriptLine[];
  visual_elements?: any;
  post_quiz_topic?: string;
  created_at?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  preferences?: {
    teaching_style?: string;
    language?: string;
    theme?: string;
    voice_speed?: number;
    auto_scaffold?: boolean;
  };
}

export interface CourseItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  file_count: number;
  created_at: string;
  materials?: Array<{
    id: string;
    filename: string;
    file_type: string;
    status: string;
    chunk_count: number;
  }>;
}

export interface ProcessingJob {
  id: string;
  filename: string;
  file_type: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  progress: number;
  current_step: string;
  chunks_created: number;
  error?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
  created_at: string;
}

export interface NoteConcept {
  term: string;
  definition: string;
}

export interface NoteFormula {
  name: string;
  expression: string;
  explanation: string;
}

export interface NoteImportantPoints {
  key_takeaways: string[];
  core_concepts: NoteConcept[];
  formulas_and_rules: NoteFormula[];
  exam_highlights: string[];
}

export interface NoteVideoScene {
  scene_number: number;
  title: string;
  visual_cue: string;
  bullet_points: string[];
  voiceover_script: string;
  duration: number;
}

export interface NoteVideoTutor {
  title: string;
  topic: string;
  duration_seconds: number;
  scenes: NoteVideoScene[];
  captions: Array<{ start_time: number; end_time: number; text: string }>;
}

export interface NoteStudyCard {
  id: string;
  front: string;
  back: string;
  category?: string;
  isMastered?: boolean;
}

export interface NoteAnalysisResult {
  title: string;
  topic: string;
  summary: string;
  important_points: NoteImportantPoints;
  video_tutor: NoteVideoTutor;
  cards: NoteStudyCard[];
  filename?: string;
  extracted_chars?: number;
}

