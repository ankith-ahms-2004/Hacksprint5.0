import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface SoilHealthReport {
  _id?: string | ObjectId;
  id?: string;
  userId: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
  region: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SoilHealthReportCreateInput = Omit<SoilHealthReport, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type SoilHealthReportUpdateInput = Partial<Omit<SoilHealthReport, '_id' | 'id' | 'createdAt' | 'updatedAt'>>;

export async function findSoilHealthReportsByUserId(userId: string): Promise<SoilHealthReport[]> {
  const db = await getDb();
  const reports = await db.collection('soil_health_reports')
    .find({ userId })
    .sort({ submittedAt: -1 })
    .toArray();
  
  return reports.map(report => ({
    ...report,
    id: report._id.toString()
  }));
}

export async function findSoilHealthReportById(id: string): Promise<SoilHealthReport | null> {
  const db = await getDb();
  const report = await db.collection('soil_health_reports').findOne({ _id: new ObjectId(id) });
  
  if (!report) return null;
  
  return {
    ...report,
    id: report._id.toString()
  };
}

export async function createSoilHealthReport(data: SoilHealthReportCreateInput): Promise<SoilHealthReport> {
  const db = await getDb();
  
  const now = new Date();
  const reportData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await db.collection('soil_health_reports').insertOne(reportData);
  
  return {
    ...reportData,
    _id: result.insertedId,
    id: result.insertedId.toString()
  };
}

export async function updateSoilHealthReport(id: string, data: SoilHealthReportUpdateInput): Promise<SoilHealthReport | null> {
  const db = await getDb();
  
  const updateData = {
    ...data,
    updatedAt: new Date()
  };
  
  await db.collection('soil_health_reports').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return findSoilHealthReportById(id);
}

export async function deleteSoilHealthReport(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('soil_health_reports').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
} 