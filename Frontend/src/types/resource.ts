// types/resource.ts
export interface Resource {
  Id: string;
  ProjectId: string;
  Name: string;
  Type: string;
  Total: number | null;
  Available: number | null;
  Description: string;
  Unit: string;
  IsDeleted: boolean;
  CreatedAt: string;
  Attachments?: Attachment[];
}

export interface ResourcePlan {
  Id: string;
  ProjectId: string;
  OwnerId: string;
  Notes: string;
  CreatedAt: string;
  IsDeleted: boolean;
  Attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}