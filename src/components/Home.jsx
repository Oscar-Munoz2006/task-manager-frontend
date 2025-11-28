import { useNavigate } from "react-router-dom"
export default function Home(){
    const navigate=useNavigate();
    return(
        <div className="bg-gradient-to-br from-[#000000] via-[#0d0d0d] to-[#1a1a1f] text-white min-h-screen">
            
        <section className="text-center py-24 px-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">Bienvenido a Task Manager</h1>
            <p>Organiza tu tiempo, mejora tus hábitos y alcanza tus metas con un
          sistema diseñado para optimizar tu productividad.</p>
          <button onClick={()=> navigate("/login")}>Comenzar ahora</button>
        </section>
       <section className="py-16 px-8 border-t border-white/10">
        <h2 className="text-3xl font-semibold text-center mb-10">
          ¿Para qué puedes usar Task Manager?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {[
            "Formación de hábitos",
            "Trabajo en equipo",
            "Gestión de tareas",
            "Gestión del tiempo",
            "Gestión de proyectos",
          ].map((title, index) => (
            <div
              key={index}
              className="bg-[#1e1e24] rounded-2xl p-6 text-center shadow-md border border-white/10 hover:scale-105 transition-transform duration-200"
            >
              <h3 className="font-medium text-lg">{title}</h3>
            </div>
          ))}
        </div>
      </section>
        <footer className="text-center py-6 text-gray-500 border-t border-white/10">
        <p>
          Desarrollado por{" "}
          <span className="text-blue-400">Oscar Muñoz</span> – ADSO SENA
        </p>
      </footer>
       </div>
    )
}