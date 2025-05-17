export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex justify-center items-start bg-gray-100 px-4 py-8">
        <div className="w-full max-w-xl space-y-10 bg-white p-8 rounded-xl shadow-lg mx-auto">
          {children}
        </div>
      </div>
    );
  }
