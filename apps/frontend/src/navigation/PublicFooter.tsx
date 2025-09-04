const PublicFooter = () => {
  return (
    <footer className="bg-gray-950 text-white px-4 py-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        {/* Copyright */}
        <h3 className="text-sm text-gray-400">
          © {new Date().getFullYear()} Prodgenie. All rights reserved.
        </h3>

        {/* Links */}
        <nav>
          <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm">
            <li>
              <a href="/privacy" className="hover:underline">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:underline">
                Terms of Service
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}

export default PublicFooter
