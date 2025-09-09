export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full py-6 mt-12 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
      <p>© {currentYear} Moneysalary. All Rights Reserved.</p>
    </footer>
  );
}
