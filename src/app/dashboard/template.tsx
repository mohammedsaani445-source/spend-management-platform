export default function Template({ children }: { children: React.ReactNode }) {
    return <div className="animate-fade-in" style={{ height: '100%', width: '100%' }}>{children}</div>;
}
