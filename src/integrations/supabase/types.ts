export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      acoes: {
        Row: {
          created_at: string;
          descricao: string;
          id: string;
          meta_id: string;
          numero: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          descricao: string;
          id?: string;
          meta_id: string;
          numero: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          descricao?: string;
          id?: string;
          meta_id?: string;
          numero?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "acoes_meta_id_fkey";
            columns: ["meta_id"];
            isOneToOne: false;
            referencedRelation: "metas";
            referencedColumns: ["id"];
          },
        ];
      };
      acoes_status: {
        Row: {
          acao_id: string;
          ano_referencia: number;
          concluida: boolean;
          created_at: string;
          id: string;
          meta_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          acao_id: string;
          ano_referencia?: number;
          concluida?: boolean;
          created_at?: string;
          id?: string;
          meta_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          acao_id?: string;
          ano_referencia?: number;
          concluida?: boolean;
          created_at?: string;
          id?: string;
          meta_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "acoes_status_acao_id_fkey";
            columns: ["acao_id"];
            isOneToOne: false;
            referencedRelation: "acoes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "acoes_status_meta_id_fkey";
            columns: ["meta_id"];
            isOneToOne: false;
            referencedRelation: "metas";
            referencedColumns: ["id"];
          },
        ];
      };
      app_settings: {
        Row: {
          app_name: string;
          created_at: string;
          current_year: number;
          id: string;
          municipality: string;
          slogan: string;
          updated_at: string;
        };
        Insert: {
          app_name?: string;
          created_at?: string;
          current_year?: number;
          id?: string;
          municipality?: string;
          slogan?: string;
          updated_at?: string;
        };
        Update: {
          app_name?: string;
          created_at?: string;
          current_year?: number;
          id?: string;
          municipality?: string;
          slogan?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      avaliacoes_anuais: {
        Row: {
          analise_qualitativa: string | null;
          ano_referencia: number;
          created_at: string;
          id: string;
          meta_id: string;
          status_atingimento: Database["public"]["Enums"]["status_atingimento_enum"];
          updated_at: string;
          user_id: string;
          valor_realizado: number | null;
        };
        Insert: {
          analise_qualitativa?: string | null;
          ano_referencia: number;
          created_at?: string;
          id?: string;
          meta_id: string;
          status_atingimento?: Database["public"]["Enums"]["status_atingimento_enum"];
          updated_at?: string;
          user_id: string;
          valor_realizado?: number | null;
        };
        Update: {
          analise_qualitativa?: string | null;
          ano_referencia?: number;
          created_at?: string;
          id?: string;
          meta_id?: string;
          status_atingimento?: Database["public"]["Enums"]["status_atingimento_enum"];
          updated_at?: string;
          user_id?: string;
          valor_realizado?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "avaliacoes_anuais_meta_id_fkey";
            columns: ["meta_id"];
            isOneToOne: false;
            referencedRelation: "metas";
            referencedColumns: ["id"];
          },
        ];
      };
      avaliacoes_anuais_audit: {
        Row: {
          alterado_em: string;
          alterado_por: string | null;
          ano_referencia: number;
          avaliacao_id: string;
          dados_anteriores: Json | null;
          dados_novos: Json | null;
          id: string;
          meta_id: string;
          operacao: string;
        };
        Insert: {
          alterado_em?: string;
          alterado_por?: string | null;
          ano_referencia: number;
          avaliacao_id: string;
          dados_anteriores?: Json | null;
          dados_novos?: Json | null;
          id?: string;
          meta_id: string;
          operacao: string;
        };
        Update: {
          alterado_em?: string;
          alterado_por?: string | null;
          ano_referencia?: number;
          avaliacao_id?: string;
          dados_anteriores?: Json | null;
          dados_novos?: Json | null;
          id?: string;
          meta_id?: string;
          operacao?: string;
        };
        Relationships: [];
      };
      diretrizes: {
        Row: {
          created_at: string;
          id: string;
          nome: string;
          numero: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nome: string;
          numero: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nome?: string;
          numero?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      metas: {
        Row: {
          created_at: string;
          criterios_avaliacao: string;
          descricao: string;
          id: string;
          indicador: string;
          meta_2026: string;
          meta_2027: string;
          meta_2028: string;
          meta_2029: string;
          meta_pas_2026: string;
          meta_plano_2026_2029: string;
          numero: number;
          objetivo_id: string;
          responsavel: string;
          unidade_medida: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          criterios_avaliacao: string;
          descricao: string;
          id?: string;
          indicador: string;
          meta_2026: string;
          meta_2027: string;
          meta_2028: string;
          meta_2029: string;
          meta_pas_2026: string;
          meta_plano_2026_2029: string;
          numero: number;
          objetivo_id: string;
          responsavel: string;
          unidade_medida: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          criterios_avaliacao?: string;
          descricao?: string;
          id?: string;
          indicador?: string;
          meta_2026?: string;
          meta_2027?: string;
          meta_2028?: string;
          meta_2029?: string;
          meta_pas_2026?: string;
          meta_plano_2026_2029?: string;
          numero?: number;
          objetivo_id?: string;
          responsavel?: string;
          unidade_medida?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "metas_objetivo_id_fkey";
            columns: ["objetivo_id"];
            isOneToOne: false;
            referencedRelation: "objetivos";
            referencedColumns: ["id"];
          },
        ];
      };
      objetivos: {
        Row: {
          created_at: string;
          descricao: string;
          diretriz_id: string;
          id: string;
          nome: string;
          numero: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          descricao: string;
          diretriz_id: string;
          id?: string;
          nome: string;
          numero: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          descricao?: string;
          diretriz_id?: string;
          id?: string;
          nome?: string;
          numero?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "objetivos_diretriz_id_fkey";
            columns: ["diretriz_id"];
            isOneToOne: false;
            referencedRelation: "diretrizes";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          ativo: boolean | null;
          cargo: string | null;
          created_at: string;
          email: string;
          id: string;
          nome: string;
          setor: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ativo?: boolean | null;
          cargo?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          nome: string;
          setor?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ativo?: boolean | null;
          cargo?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          nome?: string;
          setor?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      setores_responsaveis: {
        Row: {
          ativo: boolean;
          created_at: string;
          id: string;
          nome: string;
          nome_normalizado: string;
          updated_at: string;
        };
        Insert: {
          ativo?: boolean;
          created_at?: string;
          id?: string;
          nome: string;
          nome_normalizado: string;
          updated_at?: string;
        };
        Update: {
          ativo?: boolean;
          created_at?: string;
          id?: string;
          nome?: string;
          nome_normalizado?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_role: {
        Args: { _user_id: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      is_superadmin: { Args: never; Returns: boolean };
      import_pas_tree: {
        Args: { tree_data: Json; replace_existing?: boolean };
        Returns: Json;
      };
      rename_setor_responsavel_references: {
        Args: {
          current_normalized_name: string;
          new_display_name: string;
        };
        Returns: undefined;
      };
      restore_pas_backup: {
        Args: { backup_data: Json; replace_existing?: boolean };
        Returns: Json;
      };
    };
    Enums: {
      app_role: "admin" | "coordenador" | "gestor" | "superadmin";
      status_atingimento_enum:
        | "otimo"
        | "bom"
        | "suficiente"
        | "regular"
        | "nao_alcancado"
        | "nao_avaliado"
        | "sem_criterio";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "coordenador", "gestor", "superadmin"],
      status_atingimento_enum: [
        "otimo",
        "bom",
        "suficiente",
        "regular",
        "nao_alcancado",
        "nao_avaliado",
        "sem_criterio",
      ],
    },
  },
} as const;
