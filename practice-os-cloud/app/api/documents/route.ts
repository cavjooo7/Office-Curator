import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const clientId = String(form.get("clientId") || "");
  const taskId = String(form.get("taskId") || "");
  const documentType = String(form.get("documentType") || "Working Paper");
  if (!(file instanceof File) || !clientId) {
    return NextResponse.json({ error: "File and client are required" }, { status: 400 });
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  const task = taskId ? await prisma.task.findUnique({ where: { id: taskId }, include: { service: true } }) : null;
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const safeClient = client.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  const period = task?.period?.replace(/[^a-z0-9]+/gi, "-") || "general";
  const service = task?.service.name.replace(/[^a-z0-9]+/gi, "-") || documentType.replace(/[^a-z0-9]+/gi, "-");
  const path = `${safeClient}/FY-2026-27/${service}/${period}/${Date.now()}-${file.name}`;

  const { error } = await supabaseAdmin.storage.from("task-documents").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const document = await prisma.document.create({
    data: {
      clientId,
      taskId: taskId || null,
      documentType,
      title: file.name,
      storagePath: path,
      remarks: String(form.get("remarks") || "")
    }
  });

  return NextResponse.json({ ok: true, document });
}
