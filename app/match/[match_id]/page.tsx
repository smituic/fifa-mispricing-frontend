import { redirect } from "next/navigation";

export default async function MatchRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ match_id: string }>;
  searchParams: Promise<{ hours?: string }>;
}) {
  const { match_id } = await params;
  const { hours } = await searchParams;

  const query = hours ? `?hours=${hours}` : "";
  redirect(`/sport/fifa/match/${match_id}${query}`);
}
