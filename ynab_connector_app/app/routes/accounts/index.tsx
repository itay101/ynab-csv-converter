import { Link } from "@remix-run/react";

export default function NoteIndexPage() {
  return (
    <p>
      No account selected. Select a account on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new account.
      </Link>
    </p>
  );
}
