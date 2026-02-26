export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      acoes: {
        Row: {
          created_at: string
          descricao: string
          id: string
          meta_id: string
          numero: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          meta_id: string
          numero: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          meta_id?: string
          numero?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "acoes_meta_id_fkey"
            columns: ["meta_id"]
            isOneToOne: false
            referencedRelation: "metas"
            referencedColumns: ["id"]
          },
        ]
      }
      acoes_status: {
        Row: {
          acao_id: string
          ano: number
          concluida: boolean
          created_at: string
          id: string
          meta_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acao_id: string
          ano?: number
          concluida?: boolean
          created_at?: string
          id?: string
          meta_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acao_id?: string
          ano?: number
          concluida?: boolean
          created_at?: string
          id?: string
          meta_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          app_name: string
          created_at: string
          current_year: number
          id: string
          municipality: string
          slogan: string
          updated_at: string
        }
        Insert: {
          app_name?: string
          created_at?: string
          current_year?: number
          id?: string
          municipality?: string
          slogan?: string
          updated_at?: string
        }
        Update: {
          app_name?: string
          created_at?: string
          current_year?: number
          id?: string
          municipality?: string
          slogan?: string
          updated_at?: string
        }
        Relationships: []
      }
      diretrizes: {
        Row: {
          created_at: string
          eixo_id: string
          id: string
          nome: string
          numero: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          eixo_id: string
          id?: string
          nome: string
          numero: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          eixo_id?: string
          id?: string
          nome?: string
          numero?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diretrizes_eixo_id_fkey"
            columns: ["eixo_id"]
            isOneToOne: false
            referencedRelation: "eixos"
            referencedColumns: ["id"]
          },
        ]
      }
      eixos: {
        Row: {
          created_at: string
          id: string
          nome: string
          numero: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          numero: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          numero?: number
          updated_at?: string
        }
        Relationships: []
      }
      lancamentos: {
        Row: {
          ano: number
          created_at: string
          id: string
          justificativa: string | null
          meta_id: string
          quadrimestre: number
          resultado: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number
          created_at?: string
          id?: string
          justificativa?: string | null
          meta_id: string
          quadrimestre: number
          resultado?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          justificativa?: string | null
          meta_id?: string
          quadrimestre?: number
          resultado?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lancamentos_historico: {
        Row: {
          acao: string
          alterado_em: string
          alterado_por: string
          ano: number
          id: string
          justificativa_anterior: string | null
          justificativa_nova: string | null
          lancamento_id: string
          meta_id: string
          quadrimestre: number
          resultado_anterior: number | null
          resultado_novo: number | null
          user_id: string
        }
        Insert: {
          acao: string
          alterado_em?: string
          alterado_por: string
          ano: number
          id?: string
          justificativa_anterior?: string | null
          justificativa_nova?: string | null
          lancamento_id: string
          meta_id: string
          quadrimestre: number
          resultado_anterior?: number | null
          resultado_novo?: number | null
          user_id: string
        }
        Update: {
          acao?: string
          alterado_em?: string
          alterado_por?: string
          ano?: number
          id?: string
          justificativa_anterior?: string | null
          justificativa_nova?: string | null
          lancamento_id?: string
          meta_id?: string
          quadrimestre?: number
          resultado_anterior?: number | null
          resultado_novo?: number | null
          user_id?: string
        }
        Relationships: []
      }
      metas: {
        Row: {
          created_at: string
          descricao: string
          diretriz_id: string
          id: string
          indicador: string
          meta_plano_2025: string
          numero: number
          unidade_medida: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao: string
          diretriz_id: string
          id?: string
          indicador: string
          meta_plano_2025: string
          numero: number
          unidade_medida?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string
          diretriz_id?: string
          id?: string
          indicador?: string
          meta_plano_2025?: string
          numero?: number
          unidade_medida?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metas_diretriz_id_fkey"
            columns: ["diretriz_id"]
            isOneToOne: false
            referencedRelation: "diretrizes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome: string
          setor: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string
          email: string
          id?: string
          nome: string
          setor?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          setor?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "coordenador" | "gestor" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordenador", "gestor", "superadmin"],
    },
  },
} as const
