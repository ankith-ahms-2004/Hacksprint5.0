import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface DiseaseReport {
  _id?: string | ObjectId;
  id?: string;
  userId: string;
  cropName: string;
  diseaseDetected: string;
  region: string;
  severity: string;
  diagnosisDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DiseaseReportCreateInput = Omit<DiseaseReport, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type DiseaseReportUpdateInput = Partial<Omit<DiseaseReport, '_id' | 'id' | 'createdAt' | 'updatedAt'>>;

export async function findDiseaseReportsByUserId(userId: string): Promise<DiseaseReport[]> {
  const db = await getDb();
  const reports = await db.collection('disease_reports')
    .find({ userId })
    .sort({ diagnosisDate: -1 })
    .toArray();
  
  return reports.map(report => ({
    ...report,
    id: report._id.toString()
  }));
}

export async function findDiseaseReportById(id: string): Promise<DiseaseReport | null> {
  const db = await getDb();
  const report = await db.collection('disease_reports').findOne({ _id: new ObjectId(id) });
  
  if (!report) return null;
  
  return {
    ...report,
    id: report._id.toString()
  };
}

export async function createDiseaseReport(data: DiseaseReportCreateInput): Promise<DiseaseReport> {
  const db = await getDb();
  
  const now = new Date();
  const reportData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await db.collection('disease_reports').insertOne(reportData);
  
  return {
    ...reportData,
    _id: result.insertedId,
    id: result.insertedId.toString()
  };
}

export async function updateDiseaseReport(id: string, data: DiseaseReportUpdateInput): Promise<DiseaseReport | null> {
  const db = await getDb();
  
  const updateData = {
    ...data,
    updatedAt: new Date()
  };
  
  await db.collection('disease_reports').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return findDiseaseReportById(id);
}

export async function deleteDiseaseReport(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('disease_reports').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
} 