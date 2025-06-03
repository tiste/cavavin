import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Page() {
  async function login(formData: FormData) {
    "use server";

    const token = formData.get("token");

    if (typeof token === "string") {
      const oneYear = 1000 * 60 * 60 * 24 * 365;
      (await cookies()).set("token", token, {
        expires: new Date(Date.now() + oneYear),
      });

      redirect("/");
    }
  }

  return (
    <section className="section">
      <form action={login} className="container">
        <div className="field">
          <label className="label">Mot de passe</label>
          <div className="control">
            <input name="token" className="input" type="password" />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button className="button is-primary" type="submit">
              Valider
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
