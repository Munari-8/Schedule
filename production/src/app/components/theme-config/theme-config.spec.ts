import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeConfig } from './theme-config';

describe('ThemeConfig', () => {
  let component: ThemeConfig;
  let fixture: ComponentFixture<ThemeConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeConfig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
