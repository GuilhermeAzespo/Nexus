import React from "react";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";

export default async function InvitePage(props: {
  params: Promise<{ inviteCode: string }>;
}) {
  const params = await props.params;
  const session = await getServerAuthSession();

  if (!session) {
    // se não tiver logado, manda pro login e depois o usuário precisaria clicar no convite de novo
    // (idealmente usar callbackUrl, mas para simplificar mandamos para /login)
    return redirect("/login");
  }

  const server = await prisma.server.findUnique({
    where: {
      inviteCode: params.inviteCode,
    },
  });

  if (!server) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "white" }}>
        <h1>Invite link is invalid or has expired.</h1>
      </div>
    );
  }

  // Verifica se o usuário já é membro
  const existingMember = await prisma.member.findUnique({
    where: {
      userId_serverId: {
        userId: session.userId,
        serverId: server.id,
      },
    },
  });

  if (existingMember) {
    return redirect(`/channels/${server.id}`);
  }

  // Adiciona o usuário ao servidor
  await prisma.member.create({
    data: {
      serverId: server.id,
      userId: session.userId,
    },
  });

  return redirect(`/channels/${server.id}`);
}
