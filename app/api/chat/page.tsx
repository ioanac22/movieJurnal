import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatBox from "@/components/ChatBox";

export default async function ChatPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <main className="px-6 py-10">
      <ChatBox />
    </main>
  );
}