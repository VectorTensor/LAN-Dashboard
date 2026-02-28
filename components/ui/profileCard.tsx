import React from "react";


interface CardProps {
    title?: string;
    description: string;
}

export default function ProfieCard({
  title =  "Guest", description = "hel" }: CardProps) {
  return (
    <div className="rounded-2xl shadow-lg overflow-hidden bg-blue-500 hover:shadow-xl transition-shadow duration-300 fixed top-0 right-0 p-1 m-3">
      <div className="p-3 ">
        <h2 className="text-base font-semibold "> { title }</h2>
    </div>

    </div>
  )

}
