export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <main className='flex-1 px-6 py-8 md:px-10 md:py-12'>{children}</main>;
}
