import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan variables de entorno de Supabase. Asegúrate de tener el archivo .env.local y de que el servidor esté reiniciado.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);import { supabase } from '../supabase/supabaseClient';import { supabase } from '../supabase/supabaseClient';