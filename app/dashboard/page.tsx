"use client";
import { useUser } from "@auth0/nextjs-auth0";

import { motion } from "framer-motion";
import {
    Activity,
    Cpu,
    HardDrive,
    Network,
    ShieldCheck,
    Users,
    Settings,
    Bell
} from "lucide-react";
import { redirect } from "next/navigation";

const cards = [
    {
        title: "Network Status",
        value: "Online",
        details: "Speed: 1.2 Gbps",
        icon: Network,
        color: "text-blue-400",
        bg: "from-blue-500/10 to-blue-500/5",
    },
    {
        title: "Connected Devices",
        value: "14",
        details: "3 new today",
        icon: Users,
        color: "text-purple-400",
        bg: "from-purple-500/10 to-purple-500/5",
    },
    {
        title: "System Health",
        value: "98%",
        details: "Optimal condition",
        icon: Cpu,
        color: "text-emerald-400",
        bg: "from-emerald-500/10 to-emerald-500/5",
    },
    {
        title: "Storage Usage",
        value: "64%",
        details: "1.2 TB available",
        icon: HardDrive,
        color: "text-orange-400",
        bg: "from-orange-500/10 to-orange-500/5",
    },
    {
        title: "Security Shield",
        value: "Active",
        details: "No threats detected",
        icon: ShieldCheck,
        color: "text-cyan-400",
        bg: "from-cyan-500/10 to-cyan-500/5",
    },
    {
        title: "Recent Alerts",
        value: "0",
        details: "System is clear",
        icon: Bell,
        color: "text-rose-400",
        bg: "from-rose-500/10 to-rose-500/5",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
} as const;

export default function Dashboard() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) redirect("/auth/login");
  if (!user) redirect("/auth/login");

    return (
        <div className="min-h-screen p-8 md:p-12 lg:p-16">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-12 flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        All systems operational
                    </p>
                </div>
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 glass rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <Settings size={20} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-white text-black rounded-full font-medium flex items-center gap-2"
                    >
                        <Activity size={20} />
                        Analyze
                    </motion.button>
                </div>
            </motion.header>

            {/* Dashboard Grid */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {cards.map((card, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        whileHover={{
                            scale: 1.02,
                            y: -5,
                            transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`glass relative overflow-hidden p-6 rounded-2xl cursor-pointer group transition-all duration-300 hover:border-white/20`}
                    >
                        {/* Background Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-20 group-hover:opacity-30 transition-opacity`} />

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`p-3 rounded-xl bg-white/5 ${card.color}`}>
                                    <card.icon size={24} />
                                </div>
                                <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    <Activity size={16} />
                                </div>
                            </div>

                            <h3 className="text-zinc-400 font-medium mb-1">
                                {card.title}
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-white tracking-tight">
                                    {card.value}
                                </span>
                                <span className="text-sm text-zinc-500">
                                    {card.details}
                                </span>
                            </div>
                        </div>

                        {/* Border glow on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Footer Info */}
            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-500 text-sm"
            >
                <p>© 2026 LAN Dashboard • Powered by Next.js</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-white transition-colors">System Logs</a>
                    <a href="#" className="hover:text-white transition-colors">Network Map</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
            </motion.footer>

      <a href="/auth/logout">Logout</a>
        </div>
    );
}
