"""
Interfaz de línea de comandos para el sistema de gestión de proyectos fílmicos
"""
import sys
from gestor import GestorProyectos
from proyecto import Escena, Miembro


class CLI:
    """Interfaz de línea de comandos"""
    
    def __init__(self):
        self.gestor = GestorProyectos()
        self.comandos = {
            '1': self.crear_proyecto,
            '2': self.listar_proyectos,
            '3': self.ver_proyecto,
            '4': self.actualizar_proyecto,
            '5': self.eliminar_proyecto,
            '6': self.gestionar_escenas,
            '7': self.gestionar_equipo,
            '8': self.registrar_gasto,
            '9': self.estadisticas,
            '0': self.salir
        }
        
    def mostrar_menu_principal(self):
        """Muestra el menú principal"""
        print("\n" + "="*50)
        print("   SISTEMA DE GESTIÓN DE PROYECTOS FÍLMICOS")
        print("="*50)
        print("1. Crear nuevo proyecto")
        print("2. Listar proyectos")
        print("3. Ver detalles de proyecto")
        print("4. Actualizar proyecto")
        print("5. Eliminar proyecto")
        print("6. Gestionar escenas")
        print("7. Gestionar equipo")
        print("8. Registrar gasto")
        print("9. Ver estadísticas")
        print("0. Salir")
        print("="*50)
        
    def ejecutar(self):
        """Ejecuta el bucle principal de la aplicación"""
        print("\n¡Bienvenido al Sistema de Gestión de Proyectos Fílmicos!")
        
        while True:
            self.mostrar_menu_principal()
            opcion = input("\nSeleccione una opción: ").strip()
            
            if opcion in self.comandos:
                try:
                    self.comandos[opcion]()
                except KeyboardInterrupt:
                    print("\n\nOperación cancelada.")
                except Exception as e:
                    print(f"\nError: {e}")
            else:
                print("\nOpción no válida. Intente de nuevo.")
                
    def crear_proyecto(self):
        """Crea un nuevo proyecto"""
        print("\n--- CREAR NUEVO PROYECTO ---")
        nombre = input("Nombre del proyecto: ").strip()
        if not nombre:
            print("El nombre es obligatorio.")
            return
            
        director = input("Director: ").strip()
        if not director:
            print("El director es obligatorio.")
            return
            
        try:
            presupuesto = float(input("Presupuesto: ").strip())
        except ValueError:
            print("Presupuesto inválido.")
            return
            
        fecha_inicio = input("Fecha de inicio (YYYY-MM-DD): ").strip()
        fecha_fin = input("Fecha de fin (YYYY-MM-DD, opcional): ").strip() or None
        
        proyecto = self.gestor.crear_proyecto(nombre, director, presupuesto, 
                                              fecha_inicio, fecha_fin)
        print(f"\n✓ Proyecto creado exitosamente con ID: {proyecto.id}")
        
    def listar_proyectos(self):
        """Lista todos los proyectos"""
        print("\n--- LISTA DE PROYECTOS ---")
        
        filtro = input("Filtrar por estado (dejar vacío para ver todos): ").strip().lower()
        
        if filtro and filtro not in ['planificacion', 'en_produccion', 'postproduccion', 'completado']:
            print("Estado no válido.")
            return
            
        proyectos = self.gestor.listar_proyectos(filtro if filtro else None)
        
        if not proyectos:
            print("\nNo hay proyectos registrados.")
            return
            
        print(f"\nTotal: {len(proyectos)} proyecto(s)")
        print("-" * 80)
        for p in proyectos:
            presupuesto_rest = p.presupuesto_restante()
            print(f"ID: {p.id} | {p.nombre}")
            print(f"  Director: {p.director}")
            print(f"  Estado: {p.estado}")
            print(f"  Presupuesto: ${p.presupuesto:,.2f} | Gastado: ${p.gastos:,.2f} | Restante: ${presupuesto_rest:,.2f}")
            print(f"  Escenas: {len(p.escenas)} | Equipo: {len(p.equipo)} personas")
            print("-" * 80)
            
    def ver_proyecto(self):
        """Muestra los detalles de un proyecto"""
        print("\n--- VER DETALLES DEL PROYECTO ---")
        
        try:
            proyecto_id = int(input("ID del proyecto: ").strip())
        except ValueError:
            print("ID inválido.")
            return
            
        proyecto = self.gestor.obtener_proyecto(proyecto_id)
        if not proyecto:
            print(f"\nNo se encontró el proyecto con ID {proyecto_id}")
            return
            
        print("\n" + "="*50)
        print(f"PROYECTO: {proyecto.nombre}")
        print("="*50)
        print(f"ID: {proyecto.id}")
        print(f"Director: {proyecto.director}")
        print(f"Estado: {proyecto.estado}")
        print(f"Fecha inicio: {proyecto.fecha_inicio}")
        print(f"Fecha fin: {proyecto.fecha_fin or 'No definida'}")
        print(f"Presupuesto: ${proyecto.presupuesto:,.2f}")
        print(f"Gastos: ${proyecto.gastos:,.2f}")
        print(f"Restante: ${proyecto.presupuesto_restante():,.2f}")
        
        print(f"\nESCENAS ({len(proyecto.escenas)}):")
        if proyecto.escenas:
            for escena in proyecto.escenas:
                print(f"  {escena}")
        else:
            print("  No hay escenas registradas")
            
        print(f"\nEQUIPO ({len(proyecto.equipo)}):")
        if proyecto.equipo:
            for miembro in proyecto.equipo:
                info = f"  {miembro}"
                if miembro.email:
                    info += f" - {miembro.email}"
                print(info)
        else:
            print("  No hay miembros registrados")
            
    def actualizar_proyecto(self):
        """Actualiza un proyecto"""
        print("\n--- ACTUALIZAR PROYECTO ---")
        
        try:
            proyecto_id = int(input("ID del proyecto: ").strip())
        except ValueError:
            print("ID inválido.")
            return
            
        proyecto = self.gestor.obtener_proyecto(proyecto_id)
        if not proyecto:
            print(f"\nNo se encontró el proyecto con ID {proyecto_id}")
            return
            
        print(f"\nActualizando: {proyecto.nombre}")
        print("(Dejar vacío para mantener el valor actual)")
        
        nombre = input(f"Nombre [{proyecto.nombre}]: ").strip()
        director = input(f"Director [{proyecto.director}]: ").strip()
        fecha_fin = input(f"Fecha fin [{proyecto.fecha_fin or 'No definida'}]: ").strip()
        
        print("\nEstados disponibles: planificacion, en_produccion, postproduccion, completado")
        estado = input(f"Estado [{proyecto.estado}]: ").strip()
        
        cambios = {}
        if nombre:
            cambios['nombre'] = nombre
        if director:
            cambios['director'] = director
        if fecha_fin:
            cambios['fecha_fin'] = fecha_fin
        if estado:
            cambios['estado'] = estado
            
        if cambios:
            self.gestor.actualizar_proyecto(proyecto_id, **cambios)
            print("\n✓ Proyecto actualizado exitosamente")
        else:
            print("\nNo se realizaron cambios")
            
    def eliminar_proyecto(self):
        """Elimina un proyecto"""
        print("\n--- ELIMINAR PROYECTO ---")
        
        try:
            proyecto_id = int(input("ID del proyecto: ").strip())
        except ValueError:
            print("ID inválido.")
            return
            
        proyecto = self.gestor.obtener_proyecto(proyecto_id)
        if not proyecto:
            print(f"\nNo se encontró el proyecto con ID {proyecto_id}")
            return
            
        confirmacion = input(f"\n¿Está seguro de eliminar '{proyecto.nombre}'? (s/n): ").strip().lower()
        if confirmacion == 's':
            self.gestor.eliminar_proyecto(proyecto_id)
            print("\n✓ Proyecto eliminado exitosamente")
        else:
            print("\nOperación cancelada")
            
    def gestionar_escenas(self):
        """Gestiona las escenas de un proyecto"""
        print("\n--- GESTIONAR ESCENAS ---")
        
        try:
            proyecto_id = int(input("ID del proyecto: ").strip())
        except ValueError:
            print("ID inválido.")
            return
            
        proyecto = self.gestor.obtener_proyecto(proyecto_id)
        if not proyecto:
            print(f"\nNo se encontró el proyecto con ID {proyecto_id}")
            return
            
        print(f"\nProyecto: {proyecto.nombre}")
        print("1. Agregar escena")
        print("2. Listar escenas")
        print("3. Marcar escena como completada")
        print("4. Eliminar escena")
        
        opcion = input("\nSeleccione una opción: ").strip()
        
        if opcion == '1':
            try:
                numero = int(input("Número de escena: ").strip())
                nombre = input("Nombre: ").strip()
                locacion = input("Locación: ").strip()
                duracion = int(input("Duración estimada (minutos): ").strip())
                descripcion = input("Descripción (opcional): ").strip()
                
                escena = Escena(numero, nombre, locacion, duracion, descripcion)
                proyecto.agregar_escena(escena)
                self.gestor.guardar_datos()
                print("\n✓ Escena agregada exitosamente")
            except ValueError:
                print("Datos inválidos")
                
        elif opcion == '2':
            if proyecto.escenas:
                print("\nESCENAS:")
                for escena in proyecto.escenas:
                    print(f"  {escena}")
                    if escena.descripcion:
                        print(f"    {escena.descripcion}")
            else:
                print("\nNo hay escenas registradas")
                
        elif opcion == '3':
            try:
                numero = int(input("Número de escena: ").strip())
                for escena in proyecto.escenas:
                    if escena.numero == numero:
                        escena.marcar_completada()
                        self.gestor.guardar_datos()
                        print("\n✓ Escena marcada como completada")
                        return
                print("\nEscena no encontrada")
            except ValueError:
                print("Número inválido")
                
        elif opcion == '4':
            try:
                numero = int(input("Número de escena a eliminar: ").strip())
                if proyecto.eliminar_escena(numero):
                    self.gestor.guardar_datos()
                    print("\n✓ Escena eliminada exitosamente")
                else:
                    print("\nEscena no encontrada")
            except ValueError:
                print("Número inválido")
                
    def gestionar_equipo(self):
        """Gestiona el equipo de un proyecto"""
        print("\n--- GESTIONAR EQUIPO ---")
        
        try:
            proyecto_id = int(input("ID del proyecto: ").strip())
        except ValueError:
            print("ID inválido.")
            return
            
        proyecto = self.gestor.obtener_proyecto(proyecto_id)
        if not proyecto:
            print(f"\nNo se encontró el proyecto con ID {proyecto_id}")
            return
            
        print(f"\nProyecto: {proyecto.nombre}")
        print("1. Agregar miembro")
        print("2. Listar equipo")
        
        opcion = input("\nSeleccione una opción: ").strip()
        
        if opcion == '1':
            nombre = input("Nombre: ").strip()
            rol = input("Rol: ").strip()
            email = input("Email (opcional): ").strip()
            telefono = input("Teléfono (opcional): ").strip()
            
            if nombre and rol:
                miembro = Miembro(nombre, rol, email, telefono)
                proyecto.agregar_miembro(miembro)
                self.gestor.guardar_datos()
                print("\n✓ Miembro agregado exitosamente")
            else:
                print("\nNombre y rol son obligatorios")
                
        elif opcion == '2':
            if proyecto.equipo:
                print("\nEQUIPO:")
                for miembro in proyecto.equipo:
                    print(f"  {miembro}")
                    if miembro.email:
                        print(f"    Email: {miembro.email}")
                    if miembro.telefono:
                        print(f"    Tel: {miembro.telefono}")
            else:
                print("\nNo hay miembros registrados")
                
    def registrar_gasto(self):
        """Registra un gasto en un proyecto"""
        print("\n--- REGISTRAR GASTO ---")
        
        try:
            proyecto_id = int(input("ID del proyecto: ").strip())
        except ValueError:
            print("ID inválido.")
            return
            
        proyecto = self.gestor.obtener_proyecto(proyecto_id)
        if not proyecto:
            print(f"\nNo se encontró el proyecto con ID {proyecto_id}")
            return
            
        print(f"\nProyecto: {proyecto.nombre}")
        print(f"Presupuesto: ${proyecto.presupuesto:,.2f}")
        print(f"Gastado: ${proyecto.gastos:,.2f}")
        print(f"Disponible: ${proyecto.presupuesto_restante():,.2f}")
        
        try:
            monto = float(input("\nMonto del gasto: $").strip())
            if monto <= 0:
                print("El monto debe ser mayor a 0")
                return
                
            proyecto.registrar_gasto(monto)
            self.gestor.guardar_datos()
            
            print(f"\n✓ Gasto registrado exitosamente")
            print(f"Nuevo saldo disponible: ${proyecto.presupuesto_restante():,.2f}")
            
            if proyecto.presupuesto_restante() < 0:
                print("\n⚠ ADVERTENCIA: El proyecto ha excedido el presupuesto!")
        except ValueError:
            print("Monto inválido")
            
    def estadisticas(self):
        """Muestra estadísticas generales"""
        print("\n--- ESTADÍSTICAS GENERALES ---")
        
        stats = self.gestor.obtener_estadisticas()
        
        print(f"\nTotal de proyectos: {stats['total_proyectos']}")
        print(f"\nPor estado:")
        for estado, cantidad in stats['por_estado'].items():
            print(f"  {estado}: {cantidad}")
            
        print(f"\nPresupuesto total: ${stats['presupuesto_total']:,.2f}")
        print(f"Gastos totales: ${stats['gastos_totales']:,.2f}")
        print(f"Presupuesto restante: ${stats['presupuesto_restante']:,.2f}")
        
        if stats['presupuesto_total'] > 0:
            porcentaje = (stats['gastos_totales'] / stats['presupuesto_total']) * 100
            print(f"Porcentaje gastado: {porcentaje:.1f}%")
            
    def salir(self):
        """Sale de la aplicación"""
        print("\n¡Gracias por usar el Sistema de Gestión de Proyectos Fílmicos!")
        sys.exit(0)


def main():
    """Función principal"""
    cli = CLI()
    cli.ejecutar()


if __name__ == "__main__":
    main()
