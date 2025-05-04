export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex justify-center items-start bg-gray-100 px-4 py-8">
        <div className="w-full max-w-xl space-y-6 bg-white p-6 rounded shadow">
          {children}
        </div>
      </div>
    );
  }
  