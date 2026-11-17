import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'vedurvaktin-extension.zip');

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Zip file not found', { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="vedurvaktin-extension.zip"',
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
