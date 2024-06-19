import { Component } from '@angular/core';
import { PurchaseFormComponent } from './components/purchase-form/purchase-form.component';

@Component({
  selector: 'app-root',
  imports: [PurchaseFormComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'purchase';
}
