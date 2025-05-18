import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface GptAlert {
  _id?: string | ObjectId;
  id?: string;
  userId: string;
  title: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GptAlertCreateInput = Omit<GptAlert, '_id' | 'id' | 'createdAt' | 'updatedAt'>;
export type GptAlertUpdateInput = Partial<Omit<GptAlert, '_id' | 'id' | 'createdAt' | 'updatedAt'>>;

export async function findGptAlertsByUserId(userId: string): Promise<GptAlert[]> {
  const db = await getDb();
  const alerts = await db.collection('gpt_alerts')
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return alerts.map(alert => ({
    ...alert,
    id: alert._id.toString()
  }));
}

export async function findGptAlertById(id: string): Promise<GptAlert | null> {
  const db = await getDb();
  const alert = await db.collection('gpt_alerts').findOne({ _id: new ObjectId(id) });
  
  if (!alert) return null;
  
  return {
    ...alert,
    id: alert._id.toString()
  };
}

export async function createGptAlert(data: GptAlertCreateInput): Promise<GptAlert> {
  const db = await getDb();
  
  const now = new Date();
  const alertData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  
  const result = await db.collection('gpt_alerts').insertOne(alertData);
  
  return {
    ...alertData,
    _id: result.insertedId,
    id: result.insertedId.toString()
  };
}

export async function updateGptAlert(id: string, data: GptAlertUpdateInput): Promise<GptAlert | null> {
  const db = await getDb();
  
  const updateData = {
    ...data,
    updatedAt: new Date()
  };
  
  await db.collection('gpt_alerts').updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  
  return findGptAlertById(id);
}

export async function deleteGptAlert(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('gpt_alerts').deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
} 