export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4" />
          <div className="h-6 w-96 bg-gray-200 rounded-lg animate-pulse mx-auto" />
        </div>

        <div className="mb-8">
          <div className="h-12 w-full bg-gray-200 rounded-full animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-gray-200 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded-lg mb-2" />
                  <div className="h-4 w-24 bg-gray-200 rounded-lg" />
                </div>
              </div>
              <div className="h-4 w-full bg-gray-200 rounded-lg mb-4" />
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded-lg" />
                <div className="h-4 w-24 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 