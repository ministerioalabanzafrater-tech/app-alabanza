export type UserRole = 'admin' | 'musician'
export type VoiceType = 'soprano' | 'alto' | 'tenor' | 'bajo' | 'otro'
export type InstrumentType =
  | 'guitarra' | 'bajo' | 'bateria' | 'teclado' | 'piano'
  | 'violin' | 'cello' | 'trompeta' | 'saxofon' | 'flauta'
  | 'voz' | 'director' | 'otro'
export type EventType = 'ensayo' | 'servicio' | 'retiro' | 'otro'
export type KeyNote =
  | 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F'
  | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B'
export type AudioJobStatus = 'pending' | 'processing' | 'done' | 'error'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  instrument: InstrumentType | null
  voice: VoiceType | null
  birthday: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Song {
  id: string
  title: string
  author: string | null
  bpm: number | null
  key_note: KeyNote | null
  genre: string | null
  lyrics: string | null
  notes: string | null
  youtube_url: string | null
  active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  type: EventType
  description: string | null
  starts_at: string
  ends_at: string | null
  location: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Setlist {
  id: string
  title: string
  event_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SetlistSong {
  id: string
  setlist_id: string
  song_id: string
  position: number
  key_override: KeyNote | null
  notes: string | null
  pdf_url: string | null
  created_at: string
}

export interface SetlistMusician {
  id: string
  setlist_id: string
  musician_id: string
  instrument: InstrumentType | null
  confirmed: boolean
  notes: string | null
  created_at: string
}

export interface AudioJob {
  id: string
  user_id: string
  youtube_url: string
  original_key: KeyNote | null
  target_key: KeyNote | null
  semitones: number | null
  status: AudioJobStatus
  output_url: string | null
  error_msg: string | null
  replicate_id: string | null
  created_at: string
  updated_at: string
}

// Supabase generic Database type
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; Relationships: [] }
      songs: { Row: Song; Insert: Partial<Song>; Update: Partial<Song>; Relationships: [] }
      events: { Row: Event; Insert: Partial<Event>; Update: Partial<Event>; Relationships: [] }
      setlists: { Row: Setlist; Insert: Partial<Setlist>; Update: Partial<Setlist>; Relationships: [] }
      setlist_songs: { Row: SetlistSong; Insert: Partial<SetlistSong>; Update: Partial<SetlistSong>; Relationships: [] }
      setlist_musicians: { Row: SetlistMusician; Insert: Partial<SetlistMusician>; Update: Partial<SetlistMusician>; Relationships: [] }
      audio_jobs: { Row: AudioJob; Insert: Partial<AudioJob>; Update: Partial<AudioJob>; Relationships: [] }
    }
  }
}
