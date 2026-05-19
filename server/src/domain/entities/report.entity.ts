import type { ReportStatus, ReportContext, ReportReason, ReportAction } from '../enums/report.enums';



export interface ReportEntity {
  id:                  string;
  reporterId:          string;         
  reporter?:           { id: string; fullName: string; email: string; avatar?: string };
  reportedUserId:      string;       
  reportedUser?:       { id: string; fullName: string; email: string; avatar?: string };
  context:             ReportContext;
  reason:              ReportReason;
  additionalDetails?:  string;       
  screenshots?:        string[];     
  blockUser?:          boolean;        
  receiveUpdates?:     boolean;     
  status:              ReportStatus;
  reviewedBy?:         string;        
  reviewedAt?:         Date;          
  adminNote?:          string;         
  actionTaken?:        ReportAction;  
  createdAt:           Date;
  updatedAt:           Date;
}