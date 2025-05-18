import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTokenFromHeader, verifyToken } from '@/utils/auth';
import { TokenPayload } from '@/utils/auth';



export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop = searchParams.get('crop');
    const region = searchParams.get('region');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    let userData: TokenPayload;
    try {
      userData = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    const whereClause: any = {};
    
    whereClause.userId = userData.userId;
    
    if (crop) {
      whereClause.cropName = {
        equals: crop,
        mode: 'insensitive'
      };
    }
    
    if (region) {
      whereClause.region = {
        equals: region,
        mode: 'insensitive'
      };
    }
    
    if (startDate) {
      whereClause.diagnosisDate = {
        ...(whereClause.diagnosisDate || {}),
        gte: new Date(startDate)
      };
    }
    
    if (endDate) {
      whereClause.diagnosisDate = {
        ...(whereClause.diagnosisDate || {}),
        lte: new Date(endDate)
      };
    }
    
    const diseaseLogs = await prisma.diseaseReport.findMany({
      where: whereClause,
      orderBy: {
        diagnosisDate: 'desc'
      }
    });
    
    return NextResponse.json(diseaseLogs);
  } catch (error) {
    console.error('Error fetching disease logs:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    let userData: TokenPayload;
    try {
      userData = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
    
    const { cropName, diseaseDetected, region, severity } = await request.json();
    
    if (!cropName || !diseaseDetected || !region || !severity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const newDiseaseReport = await prisma.diseaseReport.create({
      data: {
        userId: userData.userId,
        cropName,
        diseaseDetected,
        region,
        severity,
        diagnosisDate: new Date()
      }
    });
    
    return NextResponse.json(newDiseaseReport, { status: 201 });
  } catch (error) {
    console.error('Error creating disease report:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 