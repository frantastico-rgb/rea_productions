"""
Modelo de Proyecto para gestión de producciones fílmicas
"""
from datetime import datetime
from typing import List, Optional


class Proyecto:
    """Representa un proyecto de producción fílmica"""
    
    def __init__(self, nombre: str, director: str, presupuesto: float, 
                 fecha_inicio: str, fecha_fin: str = None):
        """
        Inicializa un nuevo proyecto
        
        Args:
            nombre: Nombre del proyecto
            director: Director del proyecto
            presupuesto: Presupuesto total del proyecto
            fecha_inicio: Fecha de inicio (YYYY-MM-DD)
            fecha_fin: Fecha de finalización (YYYY-MM-DD)
        """
        self.id = None
        self.nombre = nombre
        self.director = director
        self.presupuesto = presupuesto
        self.fecha_inicio = fecha_inicio
        self.fecha_fin = fecha_fin
        self.estado = "planificacion"  # planificacion, en_produccion, postproduccion, completado
        self.escenas: List['Escena'] = []
        self.equipo: List['Miembro'] = []
        self.gastos = 0.0
        
    def agregar_escena(self, escena: 'Escena') -> None:
        """Agrega una escena al proyecto"""
        self.escenas.append(escena)
        
    def eliminar_escena(self, numero_escena: int) -> bool:
        """Elimina una escena del proyecto"""
        for i, escena in enumerate(self.escenas):
            if escena.numero == numero_escena:
                self.escenas.pop(i)
                return True
        return False
        
    def agregar_miembro(self, miembro: 'Miembro') -> None:
        """Agrega un miembro al equipo"""
        self.equipo.append(miembro)
        
    def cambiar_estado(self, nuevo_estado: str) -> None:
        """Cambia el estado del proyecto"""
        estados_validos = ["planificacion", "en_produccion", "postproduccion", "completado"]
        if nuevo_estado in estados_validos:
            self.estado = nuevo_estado
        else:
            raise ValueError(f"Estado no válido. Use uno de: {estados_validos}")
            
    def registrar_gasto(self, monto: float) -> None:
        """Registra un gasto en el proyecto"""
        self.gastos += monto
        
    def presupuesto_restante(self) -> float:
        """Calcula el presupuesto restante"""
        return self.presupuesto - self.gastos
        
    def to_dict(self) -> dict:
        """Convierte el proyecto a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'director': self.director,
            'presupuesto': self.presupuesto,
            'fecha_inicio': self.fecha_inicio,
            'fecha_fin': self.fecha_fin,
            'estado': self.estado,
            'gastos': self.gastos,
            'escenas': [escena.to_dict() for escena in self.escenas],
            'equipo': [miembro.to_dict() for miembro in self.equipo]
        }
        
    @classmethod
    def from_dict(cls, data: dict) -> 'Proyecto':
        """Crea un proyecto desde un diccionario"""
        proyecto = cls(
            nombre=data['nombre'],
            director=data['director'],
            presupuesto=data['presupuesto'],
            fecha_inicio=data['fecha_inicio'],
            fecha_fin=data.get('fecha_fin')
        )
        proyecto.id = data.get('id')
        proyecto.estado = data.get('estado', 'planificacion')
        proyecto.gastos = data.get('gastos', 0.0)
        
        # Cargar escenas
        for escena_data in data.get('escenas', []):
            proyecto.escenas.append(Escena.from_dict(escena_data))
            
        # Cargar equipo
        for miembro_data in data.get('equipo', []):
            proyecto.equipo.append(Miembro.from_dict(miembro_data))
            
        return proyecto
        
    def __str__(self) -> str:
        return f"Proyecto: {self.nombre} - Director: {self.director} - Estado: {self.estado}"


class Escena:
    """Representa una escena dentro de un proyecto"""
    
    def __init__(self, numero: int, nombre: str, locacion: str, 
                 duracion_estimada: int, descripcion: str = ""):
        """
        Inicializa una nueva escena
        
        Args:
            numero: Número de la escena
            nombre: Nombre de la escena
            locacion: Locación donde se filmará
            duracion_estimada: Duración estimada en minutos
            descripcion: Descripción de la escena
        """
        self.numero = numero
        self.nombre = nombre
        self.locacion = locacion
        self.duracion_estimada = duracion_estimada
        self.descripcion = descripcion
        self.completada = False
        
    def marcar_completada(self) -> None:
        """Marca la escena como completada"""
        self.completada = True
        
    def to_dict(self) -> dict:
        """Convierte la escena a diccionario"""
        return {
            'numero': self.numero,
            'nombre': self.nombre,
            'locacion': self.locacion,
            'duracion_estimada': self.duracion_estimada,
            'descripcion': self.descripcion,
            'completada': self.completada
        }
        
    @classmethod
    def from_dict(cls, data: dict) -> 'Escena':
        """Crea una escena desde un diccionario"""
        escena = cls(
            numero=data['numero'],
            nombre=data['nombre'],
            locacion=data['locacion'],
            duracion_estimada=data['duracion_estimada'],
            descripcion=data.get('descripcion', '')
        )
        escena.completada = data.get('completada', False)
        return escena
        
    def __str__(self) -> str:
        estado = "✓" if self.completada else "○"
        return f"[{estado}] Escena {self.numero}: {self.nombre} - {self.locacion}"


class Miembro:
    """Representa un miembro del equipo de producción"""
    
    def __init__(self, nombre: str, rol: str, email: str = "", telefono: str = ""):
        """
        Inicializa un nuevo miembro del equipo
        
        Args:
            nombre: Nombre del miembro
            rol: Rol en la producción (ej: actor, camarógrafo, etc)
            email: Email de contacto
            telefono: Teléfono de contacto
        """
        self.nombre = nombre
        self.rol = rol
        self.email = email
        self.telefono = telefono
        
    def to_dict(self) -> dict:
        """Convierte el miembro a diccionario"""
        return {
            'nombre': self.nombre,
            'rol': self.rol,
            'email': self.email,
            'telefono': self.telefono
        }
        
    @classmethod
    def from_dict(cls, data: dict) -> 'Miembro':
        """Crea un miembro desde un diccionario"""
        return cls(
            nombre=data['nombre'],
            rol=data['rol'],
            email=data.get('email', ''),
            telefono=data.get('telefono', '')
        )
        
    def __str__(self) -> str:
        return f"{self.nombre} - {self.rol}"
