import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportToExcel(tasks: Task[], filename: string = 'tareas'): void {
    const exportData = tasks.map(task => ({
      'Título': task.title,
      'Descripción': task.description,
      'Estado': task.completed ? 'Completada' : 'Pendiente',
      'Fecha Creación': this.formatDate(task.createdAt),
      'Última Actualización': this.formatDate(task.updatedAt)
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { 
      Sheets: { 'Tareas': worksheet }, 
      SheetNames: ['Tareas'] 
    };

    // Ajustar ancho de columnas
    const colWidths = [
      { width: 30 }, // Título
      { width: 50 }, // Descripción
      { width: 15 }, // Estado
      { width: 20 }, // Fecha Creación
      { width: 20 }  // Última Actualización
    ];
    worksheet['!cols'] = colWidths;

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, filename);
  }

  exportToCSV(tasks: Task[], filename: string = 'tareas'): void {
    const exportData = tasks.map(task => ({
      'Título': task.title,
      'Descripción': task.description,
      'Estado': task.completed ? 'Completada' : 'Pendiente',
      'Fecha Creación': this.formatDate(task.createdAt),
      'Última Actualización': this.formatDate(task.updatedAt)
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `${fileName}.xlsx`);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // Exportar solo completadas o pendientes
  exportCompletedTasks(tasks: Task[]): void {
    const completedTasks = tasks.filter(task => task.completed);
    this.exportToExcel(completedTasks, 'tareas-completadas');
  }

  exportPendingTasks(tasks: Task[]): void {
    const pendingTasks = tasks.filter(task => !task.completed);
    this.exportToExcel(pendingTasks, 'tareas-pendientes');
  }
}