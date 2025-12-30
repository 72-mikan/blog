import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { Token } from "@/interface/token";

export async function POST(req: Request) {
  const data:Token = await req.json();
  
  // tokenの検証
  const devodeToken =  data.token ? await verifyToken(data.token) : '';
  if (!devodeToken) {
      return NextResponse.json({
      succsess: false,
      id: null,
      role: null
    }
    , { 
      status: 200 
    });
  }

  return NextResponse.json({
    succsess: true,
    id: devodeToken.payload.sub,
    role: devodeToken.payload.role
  }
  , { 
    status: 200 
  });
}