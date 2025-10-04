"""
Gestor de proyectos fílmicos
Maneja las operaciones CRUD y persistencia de datos
"""
import json
import os
from typing import List, Optional
from proyecto import Proyecto


class GestorProyectos:
    """Gestiona las operaciones sobre proyectos fílmicos"""
    
    def __init__(self, archivo_datos: str = "proyectos.json"):
        """
        Inicializa el gestor de proyectos
        
        Args:
            archivo_datos: Ruta al archivo de datos JSON
        """
        self.archivo_datos = archivo_datos
        self.proyectos: List[Proyecto] = []
        self.proximo_id = 1
        self.cargar_datos()
        
    def crear_proyecto(self, nombre: str, director: str, presupuesto: float,
                       fecha_inicio: str, fecha_fin: str = None) -> Proyecto:
        """
        Crea un nuevo proyecto
        
        Args:
            nombre: Nombre del proyecto
            director: Director del proyecto
            presupuesto: Presupuesto del proyecto
            fecha_inicio: Fecha de inicio
            fecha_fin: Fecha de finalización (opcional)
            
        Returns:
            El proyecto creado
        """
        proyecto = Proyecto(nombre, director, presupuesto, fecha_inicio, fecha_fin)
        proyecto.id = self.proximo_id
        self.proximo_id += 1
        self.proyectos.append(proyecto)
        self.guardar_datos()
        return proyecto
        
    def obtener_proyecto(self, proyecto_id: int) -> Optional[Proyecto]:
        """
        Obtiene un proyecto por su ID
        
        Args:
            proyecto_id: ID del proyecto
            
        Returns:
            El proyecto si existe, None en caso contrario
        """
        for proyecto in self.proyectos:
            if proyecto.id == proyecto_id:
                return proyecto
        return None
        
    def listar_proyectos(self, estado: str = None) -> List[Proyecto]:
        """
        Lista todos los proyectos o filtra por estado
        
        Args:
            estado: Estado para filtrar (opcional)
            
        Returns:
            Lista de proyectos
        """
        if estado:
            return [p for p in self.proyectos if p.estado == estado]
        return self.proyectos.copy()
        
    def actualizar_proyecto(self, proyecto_id: int, **kwargs) -> bool:
        """
        Actualiza los datos de un proyecto
        
        Args:
            proyecto_id: ID del proyecto
            **kwargs: Atributos a actualizar
            
        Returns:
            True si se actualizó, False si no se encontró el proyecto
        """
        proyecto = self.obtener_proyecto(proyecto_id)
        if not proyecto:
            return False
            
        for key, value in kwargs.items():
            if hasattr(proyecto, key):
                setattr(proyecto, key, value)
                
        self.guardar_datos()
        return True
        
    def eliminar_proyecto(self, proyecto_id: int) -> bool:
        """
        Elimina un proyecto
        
        Args:
            proyecto_id: ID del proyecto a eliminar
            
        Returns:
            True si se eliminó, False si no se encontró
        """
        for i, proyecto in enumerate(self.proyectos):
            if proyecto.id == proyecto_id:
                self.proyectos.pop(i)
                self.guardar_datos()
                return True
        return False
        
    def buscar_proyectos(self, termino: str) -> List[Proyecto]:
        """
        Busca proyectos por nombre o director
        
        Args:
            termino: Término de búsqueda
            
        Returns:
            Lista de proyectos que coinciden
        """
        termino = termino.lower()
        resultados = []
        for proyecto in self.proyectos:
            if (termino in proyecto.nombre.lower() or 
                termino in proyecto.director.lower()):
                resultados.append(proyecto)
        return resultados
        
    def guardar_datos(self) -> None:
        """Guarda los proyectos en el archivo JSON"""
        datos = {
            'proximo_id': self.proximo_id,
            'proyectos': [p.to_dict() for p in self.proyectos]
        }
        with open(self.archivo_datos, 'w', encoding='utf-8') as f:
            json.dump(datos, f, ensure_ascii=False, indent=2)
            
    def cargar_datos(self) -> None:
        """Carga los proyectos desde el archivo JSON"""
        if not os.path.exists(self.archivo_datos):
            return
            
        try:
            with open(self.archivo_datos, 'r', encoding='utf-8') as f:
                datos = json.load(f)
                self.proximo_id = datos.get('proximo_id', 1)
                self.proyectos = [
                    Proyecto.from_dict(p) for p in datos.get('proyectos', [])
                ]
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Error al cargar datos: {e}")
            self.proyectos = []
            self.proximo_id = 1
            
    def obtener_estadisticas(self) -> dict:
        """
        Obtiene estadísticas generales de todos los proyectos
        
        Returns:
            Diccionario con estadísticas
        """
        total = len(self.proyectos)
        por_estado = {}
        presupuesto_total = 0
        gastos_totales = 0
        
        for proyecto in self.proyectos:
            estado = proyecto.estado
            por_estado[estado] = por_estado.get(estado, 0) + 1
            presupuesto_total += proyecto.presupuesto
            gastos_totales += proyecto.gastos
            
        return {
            'total_proyectos': total,
            'por_estado': por_estado,
            'presupuesto_total': presupuesto_total,
            'gastos_totales': gastos_totales,
            'presupuesto_restante': presupuesto_total - gastos_totales
        }
