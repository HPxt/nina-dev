import { teamMembers } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function TeamPage() {
    const getInitials = (name: string) => {
        const names = name.split(" ");
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return names[0].substring(0, 2);
    };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {teamMembers.map((member) => (
        <Link href={`/dashboard/team/${member.id}`} key={member.id}>
          <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1">
            <CardHeader className="items-center text-center">
              <Avatar className="h-20 w-20 border-2 border-primary/20">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-2xl">{getInitials(member.name)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="text-center">
              <CardTitle className="text-lg">{member.name}</CardTitle>
              <CardDescription>{member.position}</CardDescription>
              <Badge variant="outline" className="mt-2">{member.role}</Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
