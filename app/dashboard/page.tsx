"use client";

import { motion } from "framer-motion";
import {
    Activity,
    Cpu,
    HardDrive,
    Network,
    ShieldCheck,
    Users,
    Settings,
    Bell,
    Lock,
    Workflow,
    ExternalLink,
    Download,
    Database,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";


const services = [
    {
        title: "Downloads",
        description: "Manage system downloads and dispatch requests to backend gRPC service.",
        icon: Download,
        href: "/downloads",
        color: "text-purple-400",
        isExternal: false,
    },
    {
        title: "Argo CD",
        description: "Argo cd Dashboard for managing application deployments",
        icon: Lock,
        href: "https://argocd.memehub.ink/",
        color: "text-amber-400",
        isExternal: true,
    },
    {
        title: "Flink Data Pipeline",
        description: "Real-time stream processing and data pipeline monitoring.",
        icon: Workflow,
        href: "http://flink.memehub.ink/",
        color: "text-blue-400",
        isExternal: true,
    },
];



export default function Dashboard() {
    return (
        <div className="flex flex-col gap-8">
            {/* Services Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <div className="flex items-center gap-2 mb-8">
                    <h2 className="text-2xl font-bold text-white">Services & Tools</h2>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <a
                                href={service.href}
                                target={service.isExternal ? "_blank" : "_self"}
                                rel={service.isExternal ? "noopener noreferrer" : undefined}
                                className="block h-full"
                            >
                                <Card className="glass border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group h-full cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                        <div className={`p-2.5 rounded-lg bg-white/5 ${service.color}`}>
                                            <service.icon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle className="text-xl text-white group-hover:text-primary transition-colors">
                                                {service.title}
                                            </CardTitle>
                                        </div>
                                        <ExternalLink size={16} className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                                            {service.description}
                                        </CardDescription>
                                        <div className="mt-6 flex items-center gap-2 text-xs font-medium text-zinc-500 group-hover:text-white transition-colors">
                                            <span>Open Service</span>
                                            <div className="h-px flex-1 bg-white/5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
