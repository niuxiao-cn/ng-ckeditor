import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {DocumentEditorModule} from "@ng-editor/ngck/document-editor";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, DocumentEditorModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
