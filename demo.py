#!/usr/bin/env python
"""
Script de demostración del sistema de gestión de proyectos fílmicos
"""
from gestor import GestorProyectos
from proyecto import Escena, Miembro

def main():
    print("="*60)
    print("DEMOSTRACIÓN DEL SISTEMA DE GESTIÓN DE PROYECTOS FÍLMICOS")
    print("="*60)
    
    # Crear gestor
    gestor = GestorProyectos("demo_proyectos.json")
    
    # 1. Crear un proyecto
    print("\n1. CREANDO NUEVO PROYECTO...")
    proyecto = gestor.crear_proyecto(
        nombre="El Último Amanecer",
        director="María González",
        presupuesto=150000,
        fecha_inicio="2024-03-01",
        fecha_fin="2024-10-31"
    )
    print(f"✓ Proyecto creado con ID: {proyecto.id}")
    print(f"  {proyecto}")
    
    # 2. Agregar escenas
    print("\n2. AGREGANDO ESCENAS...")
    escena1 = Escena(
        numero=1,
        nombre="Escena de apertura",
        locacion="Playa al amanecer",
        duracion_estimada=45,
        descripcion="Primera escena que establece el tono"
    )
    escena2 = Escena(
        numero=2,
        nombre="Confrontación",
        locacion="Estudio interior",
        duracion_estimada=30,
        descripcion="Diálogo entre protagonistas"
    )
    proyecto.agregar_escena(escena1)
    proyecto.agregar_escena(escena2)
    gestor.guardar_datos()
    print(f"✓ {len(proyecto.escenas)} escenas agregadas")
    
    # 3. Agregar miembros al equipo
    print("\n3. AGREGANDO EQUIPO...")
    miembro1 = Miembro(
        nombre="Carlos Ruiz",
        rol="Director de Fotografía",
        email="carlos@example.com",
        telefono="555-1234"
    )
    miembro2 = Miembro(
        nombre="Ana López",
        rol="Actriz Principal",
        email="ana@example.com"
    )
    proyecto.agregar_miembro(miembro1)
    proyecto.agregar_miembro(miembro2)
    gestor.guardar_datos()
    print(f"✓ {len(proyecto.equipo)} miembros agregados al equipo")
    
    # 4. Cambiar estado del proyecto
    print("\n4. CAMBIANDO ESTADO A 'EN PRODUCCIÓN'...")
    proyecto.cambiar_estado("en_produccion")
    gestor.guardar_datos()
    print(f"✓ Estado cambiado a: {proyecto.estado}")
    
    # 5. Registrar gastos
    print("\n5. REGISTRANDO GASTOS...")
    proyecto.registrar_gasto(15000)
    proyecto.registrar_gasto(8500)
    gestor.guardar_datos()
    print(f"✓ Gastos registrados: ${proyecto.gastos:,.2f}")
    print(f"  Presupuesto restante: ${proyecto.presupuesto_restante():,.2f}")
    
    # 6. Marcar escena como completada
    print("\n6. MARCANDO ESCENA COMO COMPLETADA...")
    escena1.marcar_completada()
    gestor.guardar_datos()
    print(f"✓ Escena {escena1.numero} marcada como completada")
    
    # 7. Crear segundo proyecto
    print("\n7. CREANDO SEGUNDO PROYECTO...")
    proyecto2 = gestor.crear_proyecto(
        nombre="Documental Urbano",
        director="Pedro Martínez",
        presupuesto=50000,
        fecha_inicio="2024-04-15"
    )
    print(f"✓ Proyecto creado con ID: {proyecto2.id}")
    
    # 8. Listar todos los proyectos
    print("\n8. LISTANDO TODOS LOS PROYECTOS...")
    proyectos = gestor.listar_proyectos()
    print(f"\nTotal de proyectos: {len(proyectos)}")
    print("-" * 60)
    for p in proyectos:
        print(f"ID: {p.id} | {p.nombre}")
        print(f"  Director: {p.director}")
        print(f"  Estado: {p.estado}")
        print(f"  Presupuesto: ${p.presupuesto:,.2f}")
        print(f"  Escenas: {len(p.escenas)} | Equipo: {len(p.equipo)} personas")
        print("-" * 60)
    
    # 9. Ver detalles de un proyecto
    print("\n9. DETALLES DEL PRIMER PROYECTO...")
    proyecto_detalle = gestor.obtener_proyecto(proyecto.id)
    print(f"\nPROYECTO: {proyecto_detalle.nombre}")
    print(f"Director: {proyecto_detalle.director}")
    print(f"Estado: {proyecto_detalle.estado}")
    print(f"Presupuesto: ${proyecto_detalle.presupuesto:,.2f}")
    print(f"Gastos: ${proyecto_detalle.gastos:,.2f}")
    print(f"Restante: ${proyecto_detalle.presupuesto_restante():,.2f}")
    
    print(f"\nEscenas ({len(proyecto_detalle.escenas)}):")
    for escena in proyecto_detalle.escenas:
        print(f"  {escena}")
    
    print(f"\nEquipo ({len(proyecto_detalle.equipo)}):")
    for miembro in proyecto_detalle.equipo:
        print(f"  {miembro}")
    
    # 10. Estadísticas generales
    print("\n10. ESTADÍSTICAS GENERALES...")
    stats = gestor.obtener_estadisticas()
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
    
    # 11. Buscar proyectos
    print("\n11. BÚSQUEDA DE PROYECTOS...")
    resultados = gestor.buscar_proyectos("Último")
    print(f"Resultados para 'Último': {len(resultados)} proyecto(s)")
    for p in resultados:
        print(f"  - {p.nombre} ({p.director})")
    
    print("\n" + "="*60)
    print("DEMOSTRACIÓN COMPLETADA")
    print("="*60)
    print(f"\nDatos guardados en: demo_proyectos.json")
    print("Para iniciar la aplicación interactiva ejecute: python app.py")

if __name__ == "__main__":
    main()
