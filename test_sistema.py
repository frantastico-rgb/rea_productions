"""
Tests para el sistema de gestión de proyectos fílmicos
"""
import unittest
import os
import json
from proyecto import Proyecto, Escena, Miembro
from gestor import GestorProyectos


class TestProyecto(unittest.TestCase):
    """Tests para la clase Proyecto"""
    
    def setUp(self):
        """Configuración antes de cada test"""
        self.proyecto = Proyecto(
            nombre="Mi Película",
            director="Juan Pérez",
            presupuesto=100000,
            fecha_inicio="2024-01-01",
            fecha_fin="2024-12-31"
        )
        
    def test_crear_proyecto(self):
        """Test crear un proyecto"""
        self.assertEqual(self.proyecto.nombre, "Mi Película")
        self.assertEqual(self.proyecto.director, "Juan Pérez")
        self.assertEqual(self.proyecto.presupuesto, 100000)
        self.assertEqual(self.proyecto.estado, "planificacion")
        
    def test_agregar_escena(self):
        """Test agregar una escena"""
        escena = Escena(1, "Escena de apertura", "Estudio", 30)
        self.proyecto.agregar_escena(escena)
        self.assertEqual(len(self.proyecto.escenas), 1)
        self.assertEqual(self.proyecto.escenas[0].nombre, "Escena de apertura")
        
    def test_eliminar_escena(self):
        """Test eliminar una escena"""
        escena = Escena(1, "Escena de apertura", "Estudio", 30)
        self.proyecto.agregar_escena(escena)
        resultado = self.proyecto.eliminar_escena(1)
        self.assertTrue(resultado)
        self.assertEqual(len(self.proyecto.escenas), 0)
        
    def test_eliminar_escena_inexistente(self):
        """Test eliminar una escena que no existe"""
        resultado = self.proyecto.eliminar_escena(999)
        self.assertFalse(resultado)
        
    def test_agregar_miembro(self):
        """Test agregar un miembro al equipo"""
        miembro = Miembro("Ana López", "Actriz Principal")
        self.proyecto.agregar_miembro(miembro)
        self.assertEqual(len(self.proyecto.equipo), 1)
        self.assertEqual(self.proyecto.equipo[0].nombre, "Ana López")
        
    def test_cambiar_estado(self):
        """Test cambiar el estado del proyecto"""
        self.proyecto.cambiar_estado("en_produccion")
        self.assertEqual(self.proyecto.estado, "en_produccion")
        
    def test_cambiar_estado_invalido(self):
        """Test cambiar a un estado inválido"""
        with self.assertRaises(ValueError):
            self.proyecto.cambiar_estado("estado_invalido")
            
    def test_registrar_gasto(self):
        """Test registrar un gasto"""
        self.proyecto.registrar_gasto(5000)
        self.assertEqual(self.proyecto.gastos, 5000)
        self.proyecto.registrar_gasto(3000)
        self.assertEqual(self.proyecto.gastos, 8000)
        
    def test_presupuesto_restante(self):
        """Test calcular presupuesto restante"""
        self.proyecto.registrar_gasto(30000)
        restante = self.proyecto.presupuesto_restante()
        self.assertEqual(restante, 70000)
        
    def test_to_dict(self):
        """Test convertir proyecto a diccionario"""
        data = self.proyecto.to_dict()
        self.assertIsInstance(data, dict)
        self.assertEqual(data['nombre'], "Mi Película")
        self.assertEqual(data['director'], "Juan Pérez")
        
    def test_from_dict(self):
        """Test crear proyecto desde diccionario"""
        data = self.proyecto.to_dict()
        proyecto_nuevo = Proyecto.from_dict(data)
        self.assertEqual(proyecto_nuevo.nombre, self.proyecto.nombre)
        self.assertEqual(proyecto_nuevo.director, self.proyecto.director)


class TestEscena(unittest.TestCase):
    """Tests para la clase Escena"""
    
    def setUp(self):
        """Configuración antes de cada test"""
        self.escena = Escena(
            numero=1,
            nombre="Escena de apertura",
            locacion="Estudio A",
            duracion_estimada=45,
            descripcion="Primera escena del proyecto"
        )
        
    def test_crear_escena(self):
        """Test crear una escena"""
        self.assertEqual(self.escena.numero, 1)
        self.assertEqual(self.escena.nombre, "Escena de apertura")
        self.assertEqual(self.escena.locacion, "Estudio A")
        self.assertFalse(self.escena.completada)
        
    def test_marcar_completada(self):
        """Test marcar escena como completada"""
        self.escena.marcar_completada()
        self.assertTrue(self.escena.completada)
        
    def test_to_dict(self):
        """Test convertir escena a diccionario"""
        data = self.escena.to_dict()
        self.assertIsInstance(data, dict)
        self.assertEqual(data['numero'], 1)
        self.assertEqual(data['nombre'], "Escena de apertura")
        
    def test_from_dict(self):
        """Test crear escena desde diccionario"""
        data = self.escena.to_dict()
        escena_nueva = Escena.from_dict(data)
        self.assertEqual(escena_nueva.numero, self.escena.numero)
        self.assertEqual(escena_nueva.nombre, self.escena.nombre)


class TestMiembro(unittest.TestCase):
    """Tests para la clase Miembro"""
    
    def setUp(self):
        """Configuración antes de cada test"""
        self.miembro = Miembro(
            nombre="Carlos Ruiz",
            rol="Director de Fotografía",
            email="carlos@example.com",
            telefono="123456789"
        )
        
    def test_crear_miembro(self):
        """Test crear un miembro"""
        self.assertEqual(self.miembro.nombre, "Carlos Ruiz")
        self.assertEqual(self.miembro.rol, "Director de Fotografía")
        self.assertEqual(self.miembro.email, "carlos@example.com")
        
    def test_to_dict(self):
        """Test convertir miembro a diccionario"""
        data = self.miembro.to_dict()
        self.assertIsInstance(data, dict)
        self.assertEqual(data['nombre'], "Carlos Ruiz")
        self.assertEqual(data['rol'], "Director de Fotografía")
        
    def test_from_dict(self):
        """Test crear miembro desde diccionario"""
        data = self.miembro.to_dict()
        miembro_nuevo = Miembro.from_dict(data)
        self.assertEqual(miembro_nuevo.nombre, self.miembro.nombre)
        self.assertEqual(miembro_nuevo.rol, self.miembro.rol)


class TestGestorProyectos(unittest.TestCase):
    """Tests para la clase GestorProyectos"""
    
    def setUp(self):
        """Configuración antes de cada test"""
        self.archivo_test = "test_proyectos.json"
        self.gestor = GestorProyectos(self.archivo_test)
        
    def tearDown(self):
        """Limpieza después de cada test"""
        if os.path.exists(self.archivo_test):
            os.remove(self.archivo_test)
            
    def test_crear_proyecto(self):
        """Test crear un proyecto"""
        proyecto = self.gestor.crear_proyecto(
            nombre="Proyecto Test",
            director="Test Director",
            presupuesto=50000,
            fecha_inicio="2024-01-01"
        )
        self.assertIsNotNone(proyecto.id)
        self.assertEqual(proyecto.nombre, "Proyecto Test")
        self.assertEqual(len(self.gestor.proyectos), 1)
        
    def test_obtener_proyecto(self):
        """Test obtener un proyecto por ID"""
        proyecto = self.gestor.crear_proyecto(
            nombre="Proyecto Test",
            director="Test Director",
            presupuesto=50000,
            fecha_inicio="2024-01-01"
        )
        proyecto_obtenido = self.gestor.obtener_proyecto(proyecto.id)
        self.assertIsNotNone(proyecto_obtenido)
        self.assertEqual(proyecto_obtenido.nombre, "Proyecto Test")
        
    def test_obtener_proyecto_inexistente(self):
        """Test obtener un proyecto que no existe"""
        proyecto = self.gestor.obtener_proyecto(999)
        self.assertIsNone(proyecto)
        
    def test_listar_proyectos(self):
        """Test listar todos los proyectos"""
        self.gestor.crear_proyecto("Proyecto 1", "Director 1", 10000, "2024-01-01")
        self.gestor.crear_proyecto("Proyecto 2", "Director 2", 20000, "2024-02-01")
        proyectos = self.gestor.listar_proyectos()
        self.assertEqual(len(proyectos), 2)
        
    def test_listar_proyectos_por_estado(self):
        """Test listar proyectos filtrados por estado"""
        proyecto1 = self.gestor.crear_proyecto("Proyecto 1", "Director 1", 10000, "2024-01-01")
        proyecto2 = self.gestor.crear_proyecto("Proyecto 2", "Director 2", 20000, "2024-02-01")
        proyecto2.cambiar_estado("en_produccion")
        
        proyectos_planificacion = self.gestor.listar_proyectos("planificacion")
        proyectos_produccion = self.gestor.listar_proyectos("en_produccion")
        
        self.assertEqual(len(proyectos_planificacion), 1)
        self.assertEqual(len(proyectos_produccion), 1)
        
    def test_actualizar_proyecto(self):
        """Test actualizar un proyecto"""
        proyecto = self.gestor.crear_proyecto("Proyecto Test", "Director", 10000, "2024-01-01")
        resultado = self.gestor.actualizar_proyecto(proyecto.id, nombre="Nuevo Nombre")
        self.assertTrue(resultado)
        proyecto_actualizado = self.gestor.obtener_proyecto(proyecto.id)
        self.assertEqual(proyecto_actualizado.nombre, "Nuevo Nombre")
        
    def test_actualizar_proyecto_inexistente(self):
        """Test actualizar un proyecto que no existe"""
        resultado = self.gestor.actualizar_proyecto(999, nombre="Test")
        self.assertFalse(resultado)
        
    def test_eliminar_proyecto(self):
        """Test eliminar un proyecto"""
        proyecto = self.gestor.crear_proyecto("Proyecto Test", "Director", 10000, "2024-01-01")
        resultado = self.gestor.eliminar_proyecto(proyecto.id)
        self.assertTrue(resultado)
        self.assertEqual(len(self.gestor.proyectos), 0)
        
    def test_eliminar_proyecto_inexistente(self):
        """Test eliminar un proyecto que no existe"""
        resultado = self.gestor.eliminar_proyecto(999)
        self.assertFalse(resultado)
        
    def test_buscar_proyectos(self):
        """Test buscar proyectos"""
        self.gestor.crear_proyecto("Película de Acción", "Director A", 10000, "2024-01-01")
        self.gestor.crear_proyecto("Documental", "Director B", 5000, "2024-02-01")
        
        resultados = self.gestor.buscar_proyectos("Película")
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0].nombre, "Película de Acción")
        
    def test_persistencia_datos(self):
        """Test guardar y cargar datos"""
        proyecto = self.gestor.crear_proyecto("Proyecto Test", "Director", 10000, "2024-01-01")
        proyecto_id = proyecto.id
        
        # Crear un nuevo gestor que cargue los datos
        gestor_nuevo = GestorProyectos(self.archivo_test)
        proyecto_cargado = gestor_nuevo.obtener_proyecto(proyecto_id)
        
        self.assertIsNotNone(proyecto_cargado)
        self.assertEqual(proyecto_cargado.nombre, "Proyecto Test")
        
    def test_obtener_estadisticas(self):
        """Test obtener estadísticas"""
        proyecto1 = self.gestor.crear_proyecto("Proyecto 1", "Director 1", 10000, "2024-01-01")
        proyecto2 = self.gestor.crear_proyecto("Proyecto 2", "Director 2", 20000, "2024-02-01")
        proyecto1.registrar_gasto(3000)
        proyecto2.registrar_gasto(5000)
        
        stats = self.gestor.obtener_estadisticas()
        
        self.assertEqual(stats['total_proyectos'], 2)
        self.assertEqual(stats['presupuesto_total'], 30000)
        self.assertEqual(stats['gastos_totales'], 8000)
        self.assertEqual(stats['presupuesto_restante'], 22000)


if __name__ == '__main__':
    unittest.main()
