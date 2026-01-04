/**
 * Tag-related TypeScript interfaces and types
 */

export interface TagColor {
  id: number;
  name: string;
  hex_code: string;
}

export interface Tag {
  id: number;
  name: string;
  color_id: number | null;
  color?: TagColor;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TagsResponse {
  success: boolean;
  msg?: string;
  data: {
    tags: Tag[];
  };
}

export interface TagResponse {
  success: boolean;
  msg?: string;
  data: {
    tag: Tag;
  };
}

export interface CreateTagPayload {
  name: string;
  color_id?: number | null;
}

export interface UpdateTagPayload {
  id: number;
  name?: string;
  color_id?: number | null;
}

export interface DeleteTagPayload {
  id: number;
}

