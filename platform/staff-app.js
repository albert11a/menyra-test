/* =========================================================
   MENYRA – Platform Staff Admin (Dummy)
   Step: DUMMY-P1.3 HOTFIX — Staff Layout + funktionierende UI

   Diese Datei ist absichtlich klein.

   Aufgaben:
   - Dummy-Gate: staff.html darf nur erreichbar sein, wenn Dummy-Login gesetzt ist
     (localStorage key: menyra_dummy_staff_logged_in)

   Später (Logik-Phase):
   - Firebase Auth Login
   - Firestore Check: platformStaff/{uid}
   - Staff sieht nur Leads/Kunden mit assignedStaffId === uid
   ========================================================= */

(function staffDummyGate(){
  const ok = localStorage.getItem("menyra_dummy_staff_logged_in") === "1";
  if (!ok){
    // zurück zur getrennten Staff-Login-Seite
    location.replace("./staff-login.html");
  }
})();
