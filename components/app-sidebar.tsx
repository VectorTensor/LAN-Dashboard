"use client";

import * as React from "react";
import {
    LayoutDashboard,
    Lock,
    Workflow,
    FileText,
    Settings,
    User as UserIcon,
    ChevronUp,
    Download,
    Database,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Downloads",
        url: "/downloads",
        icon: Download,
    },
    {
        title: "Redis Cache",
        url: "/redis",
        icon: Database,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-zinc-950">
            <SidebarHeader className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-black font-bold">
                        L
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-white">LAN Dashboard</span>
                        <span className="text-xs text-zinc-400">v1.0.0</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-zinc-500">Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <a href={item.url} className="text-zinc-400 hover:text-white transition-colors">
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full text-zinc-400 hover:text-white">
                                    <UserIcon className="size-5" />
                                    <span className="group-data-[collapsible=icon]:hidden">
                                        User
                                    </span>
                                    <ChevronUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-zinc-900 border-white/5 text-zinc-400"
                            >
                                <DropdownMenuItem className="focus:bg-white/5 focus:text-white transition-colors cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
