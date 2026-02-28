import {auth0} from "@/lib/auth0";

interface DashboardCardProps{
  className: string;
  title: string;
  description: string;
}

export default function DashboardCard(
  {
    className="",
    title = "",
    description = ""

  }: DashboardCardProps
) {
    const session = auth0.getSession()
    return(
  <div className={className}>
    <div className="text-base p-3">
      {title}
  </div>
    <div className = "text-xs p-3">
      {description}
  </div>

  </div>
    );


}
