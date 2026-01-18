import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Building2, Music, Settings, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // Protect Admin Route
    if (!session?.user?.admin) {
        console.log("Access Denied: Is Admin?", session?.user?.admin);
        redirect('/');
    }

    const navItems = [
        { href: "/admin/themes", label: "Theme Music", icon: Music },
        { href: "/admin/settings", label: "General", icon: Settings },
        { href: "/admin/users", label: "Users", icon: Users },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-[#111] flex flex-col">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <Building2 className="text-neonBlue" />
                    <span className="font-bold text-xl tracking-tighter">ADMIN</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg mb-6 transition-colors">
                        <ArrowLeft size={18} />
                        Back to App
                    </Link>

                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-neonBlue hover:bg-white/5 rounded-lg transition-all"
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
