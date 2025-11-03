// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { BrowserView } from 'electron';
import { DarkThemeBGColor, getUserHomeDir, LightThemeBGColor } from '../utils';
import * as path from 'path';
import * as fs from 'fs';
import { appData } from '../config/appdata';
import { IRegistry } from '../registry';
import { EventTypeMain, EventTypeRenderer } from '../eventtypes';
import { identifyUser, logEvent } from '../telemetry_utils';

const maxRecentItems = 5;

interface IRecentSessionListItem {
  isRemote: boolean;
  linkLabel: string;
  linkTooltip: string;
  linkDetail?: string;
}

export class WelcomeView {
  constructor(options: WelcomeView.IOptions) {
    identifyUser();
    logEvent('desktop_welcome_view_loaded');

    this._registry = options.registry;
    this._isDarkTheme = options.isDarkTheme;
    this._view = new BrowserView({
      webPreferences: {
        preload: path.join(__dirname, './preload.js'),
        devTools: process.env.NODE_ENV === 'development'
      }
    });

    this._view.setBackgroundColor(
      this._isDarkTheme ? DarkThemeBGColor : LightThemeBGColor
    );

    const welcomeViewCSS = fs.readFileSync(
      path.join(__dirname, './welcomeview.css')
    ).toString();
    const notebookIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 22 22">
      <g class="jp-icon-warn0 jp-icon-selectable" fill="#EF6C00">
        <path d="M18.7 3.3v15.4H3.3V3.3h15.4m1.5-1.5H1.8v18.3h18.3l.1-18.3z"/>
        <path d="M16.5 16.5l-5.4-4.3-5.6 4.3v-11h11z"/>
      </g>
      </svg>`;
    const openIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M88.7 223.8L0 375.8V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H416c35.3 0 64 28.7 64 64v32H144c-22.8 0-43.8 12.1-55.3 31.8zm27.6 16.1C122.1 230 132.6 224 144 224H544c11.5 0 22 6.1 27.7 16.1s5.7 22.2-.1 32.1l-112 192C453.9 474 443.4 480 432 480H32c-11.5 0-22-6.1-27.7-16.1s-5.7-22.2 .1-32.1l112-192z"/></svg>`;
    
    // Theme-specific CSS variables
    const isDark = this._isDarkTheme;
    const themeCSS = `
      :root {
        --bg-color: ${isDark ? '#1a1a1a' : '#ffffff'};
        --text-color: ${isDark ? '#ffffff' : '#000000'};
        --subtitle-color: ${isDark ? '#888888' : '#666666'};
        --action-button-bg: ${isDark ? '#2a2a2a' : '#f5f5f5'};
        --action-button-border: ${isDark ? '#404040' : '#e0e0e0'};
        --action-button-hover-bg: ${isDark ? '#3a3a3a' : '#eeeeee'};
        --action-button-hover-border: ${isDark ? '#555555' : '#d0d0d0'};
        --recent-item-bg: ${isDark ? '#2a2a2a' : '#f8f8f8'};
        --recent-item-border: ${isDark ? '#404040' : '#e0e0e0'};
        --recent-item-hover-bg: ${isDark ? '#3a3a3a' : '#f0f0f0'};
        --no-recent-bg: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
        --no-recent-border: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
        --link-color: ${isDark ? '#4a9eff' : '#0066cc'};
        --notification-bg: ${isDark ? '#2a2a2a' : '#ffffff'};
        --notification-border: ${isDark ? '#404040' : '#e0e0e0'};
        --spinner-border: ${isDark ? '#404040' : '#e0e0e0'};
        --install-button-bg: ${isDark ? '#4a9eff' : '#0066cc'};
        --install-button-hover-bg: ${isDark ? '#3a8bdf' : '#0052a3'};
        --delete-hover-color: ${isDark ? '#ff6b6b' : '#e74c3c'};
        --prompt-input-color: ${isDark ? '#ffffff' : '#000000'};
        --prompt-placeholder-color: ${isDark ? '#D0D0D0' : '#666666'};
        --example-button-color: ${isDark ? '#D0D0D0' : '#666666'};
        
        /* AI Input Field Theme Variables */
        --input-wrapper-bg: ${isDark 
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 0.9) 0%, rgba(28, 24, 36, 0.95) 50%, rgba(19, 15, 26, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 252, 0.98) 50%, rgba(248, 248, 250, 0.95) 100%)'};
        --input-wrapper-border: ${isDark ? 'rgba(157, 108, 255, 0.4)' : 'rgba(157, 108, 255, 0.3)'};
        --input-wrapper-shadow: ${isDark
          ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 12px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.2), 0 0 20px rgba(157, 108, 255, 0.2), 0 0 40px rgba(157, 108, 255, 0.1)'
          : '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 0 15px rgba(157, 108, 255, 0.15), 0 0 30px rgba(157, 108, 255, 0.08)'};
        --input-wrapper-overlay-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(157, 108, 255, 0.03) 100%)'
          : 'linear-gradient(135deg, rgba(157, 108, 255, 0.05) 0%, rgba(157, 108, 255, 0.02) 50%, rgba(255, 255, 255, 0.03) 100%)'};
        --input-wrapper-shimmer-bg: ${isDark
          ? 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)'
          : 'linear-gradient(90deg, rgba(157, 108, 255, 0) 0%, rgba(157, 108, 255, 0.08) 50%, rgba(157, 108, 255, 0) 100%)'};
        --input-wrapper-hover-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 0.95) 0%, rgba(28, 24, 36, 1) 50%, rgba(19, 15, 26, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(252, 252, 255, 1) 50%, rgba(250, 250, 252, 1) 100%)'};
        --input-wrapper-hover-border: ${isDark ? 'rgba(157, 108, 255, 0.6)' : 'rgba(157, 108, 255, 0.5)'};
        --input-wrapper-hover-shadow: ${isDark
          ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.5), 0 4px 24px rgba(157, 108, 255, 0.3), 0 2px 12px rgba(172, 132, 252, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(157, 108, 255, 0.2)'
          : '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 20px rgba(157, 108, 255, 0.2), 0 2px 10px rgba(157, 108, 255, 0.15)'};
        --input-wrapper-focus-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 1) 0%, rgba(28, 24, 36, 1) 50%, rgba(25, 20, 35, 1) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 1) 100%)'};
        --input-wrapper-focus-border: ${isDark ? 'rgba(157, 108, 255, 0.8)' : 'rgba(157, 108, 255, 0.6)'};
        --input-wrapper-focus-shadow: ${isDark
          ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 6px 24px rgba(0, 0, 0, 0.4), 0 3px 12px rgba(0, 0, 0, 0.6), 0 8px 32px rgba(157, 108, 255, 0.4), 0 4px 16px rgba(172, 132, 252, 0.3), 0 2px 8px rgba(192, 132, 252, 0.25), 0 0 0 4px rgba(157, 108, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(157, 108, 255, 0.3), inset 0 0 20px rgba(157, 108, 255, 0.1)'
          : '0 6px 24px rgba(0, 0, 0, 0.12), 0 3px 12px rgba(0, 0, 0, 0.1), 0 8px 28px rgba(157, 108, 255, 0.25), 0 4px 14px rgba(157, 108, 255, 0.2), 0 0 0 4px rgba(157, 108, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 1)'};
        --input-wrapper-generating-shadow: ${isDark
          ? '0 8px 32px rgba(157, 108, 255, 0.4), 0 4px 16px rgba(172, 132, 252, 0.3), 0 2px 8px rgba(192, 132, 252, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(157, 108, 255, 0.15)'
          : '0 4px 20px rgba(157, 108, 255, 0.25), 0 2px 10px rgba(157, 108, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 1), inset 0 0 15px rgba(157, 108, 255, 0.1)'};
        --input-icon-color: ${isDark ? '#9D6CFF' : '#7C4DFF'};
        --input-icon-shadow: ${isDark 
          ? 'drop-shadow(0 2px 4px rgba(157, 108, 255, 0.3))'
          : 'drop-shadow(0 2px 4px rgba(157, 108, 255, 0.4))'};
        --input-icon-focus-color: ${isDark ? '#ac84fc' : '#6A37E5'};
        --input-icon-focus-shadow: ${isDark
          ? 'drop-shadow(0 4px 8px rgba(157, 108, 255, 0.5))'
          : 'drop-shadow(0 4px 8px rgba(157, 108, 255, 0.6))'};
        --input-icon-hover-color: ${isDark ? '#9D6CFF' : '#7C4DFF'};
        --input-icon-hover-shadow: ${isDark
          ? 'drop-shadow(0 3px 6px rgba(157, 108, 255, 0.4))'
          : 'drop-shadow(0 3px 6px rgba(157, 108, 255, 0.5))'};
        --input-sparkle-color: ${isDark ? '#ac84fc' : '#9D6CFF'};
        --input-button-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(157, 108, 255, 0.2) 0%, rgba(172, 132, 252, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(157, 108, 255, 0.15) 0%, rgba(157, 108, 255, 0.1) 100%)'};
        --input-button-color: ${isDark ? '#9D6CFF' : '#7C4DFF'};
        --input-button-shadow: ${isDark
          ? '0 2px 8px rgba(157, 108, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 2px 6px rgba(157, 108, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.9)'};
        --input-button-hover-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(157, 108, 255, 0.3) 0%, rgba(172, 132, 252, 0.2) 100%)'
          : 'linear-gradient(135deg, rgba(157, 108, 255, 0.25) 0%, rgba(157, 108, 255, 0.15) 100%)'};
        --input-button-hover-shadow: ${isDark
          ? '0 4px 16px rgba(157, 108, 255, 0.3), 0 2px 8px rgba(172, 132, 252, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 4px 12px rgba(157, 108, 255, 0.35), 0 2px 6px rgba(157, 108, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)'};
        --example-button-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 0.8) 0%, rgba(28, 24, 36, 0.9) 50%, rgba(19, 15, 26, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(250, 250, 252, 0.95) 50%, rgba(248, 248, 250, 0.9) 100%)'};
        --example-button-border: ${isDark ? 'rgba(157, 108, 255, 0.3)' : 'rgba(157, 108, 255, 0.25)'};
        --example-button-shadow: ${isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)'};
        --example-button-hover-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 0.9) 0%, rgba(28, 24, 36, 1) 50%, rgba(19, 15, 26, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(252, 252, 255, 1) 50%, rgba(250, 250, 252, 1) 100%)'};
        --example-button-hover-border: ${isDark ? 'rgba(157, 108, 255, 0.5)' : 'rgba(157, 108, 255, 0.4)'};
        --example-button-hover-shadow: ${isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(157, 108, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(157, 108, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 1)'};
        --radio-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 0.6) 0%, rgba(28, 24, 36, 0.7) 50%, rgba(19, 15, 26, 0.6) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(250, 250, 252, 0.85) 50%, rgba(248, 248, 250, 0.8) 100%)'};
        --radio-border: ${isDark ? 'rgba(157, 108, 255, 0.3)' : 'rgba(157, 108, 255, 0.25)'};
        --radio-hover-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(34, 27, 46, 0.8) 0%, rgba(28, 24, 36, 0.9) 50%, rgba(19, 15, 26, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 252, 255, 0.98) 50%, rgba(250, 250, 252, 0.95) 100%)'};
        --radio-hover-border: ${isDark ? 'rgba(157, 108, 255, 0.5)' : 'rgba(157, 108, 255, 0.4)'};
        --radio-checked-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(157, 108, 255, 0.2) 0%, rgba(172, 132, 252, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(157, 108, 255, 0.15) 0%, rgba(157, 108, 255, 0.1) 100%)'};
        --radio-checked-border: ${isDark ? 'rgba(157, 108, 255, 0.6)' : 'rgba(157, 108, 255, 0.5)'};
        --radio-text-color: ${isDark ? '#ffffff' : '#000000'};
        --radio-text-hover-color: ${isDark ? '#ac84fc' : '#7C4DFF'};
        --creation-button-primary-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(157, 108, 255, 0.15) 0%, rgba(172, 132, 252, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(157, 108, 255, 0.12) 0%, rgba(157, 108, 255, 0.08) 100%)'};
        --creation-button-primary-border: ${isDark ? 'rgba(157, 108, 255, 0.4)' : 'rgba(157, 108, 255, 0.3)'};
        --creation-button-primary-hover-bg: ${isDark
          ? 'linear-gradient(135deg, rgba(157, 108, 255, 0.25) 0%, rgba(172, 132, 252, 0.15) 100%)'
          : 'linear-gradient(135deg, rgba(157, 108, 255, 0.18) 0%, rgba(157, 108, 255, 0.12) 100%)'};
        --creation-button-primary-hover-border: ${isDark ? 'rgba(157, 108, 255, 0.5)' : 'rgba(157, 108, 255, 0.4)'};
        --creation-button-primary-icon-color: ${isDark ? '#9D6CFF' : '#7C4DFF'};
        --deliverable-label-color: ${isDark ? '#888888' : '#999999'};
      }
    `;

    this._pageSource = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
          <title>Welcome to Mito</title>
          <style>
            ${themeCSS}
            ${welcomeViewCSS}
          </style>
          <script>
            document.addEventListener("DOMContentLoaded", () => {
              const platform = "${process.platform}";
              document.body.dataset.appPlatform = platform;
              document.body.classList.add('app-ui-' + platform);
            });
          </script>
        </head>
      
        <body class="${this._isDarkTheme ? 'app-ui-dark' : ''}" title="">
          <svg class="symbol" style="display: none;">
            <defs>
              <symbol id="circle-xmark" viewBox="0 0 512 512">
                <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/>
              </symbol>
              <symbol id="triangle-exclamation" viewBox="0 0 512 512">
                <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32z"/>
              </symbol>
              <symbol id="checkmark-success" viewBox="0 0 512 512">
                <path fill="#2BB673" d="M489,255.9c0-0.2,0-0.5,0-0.7c0-1.6,0-3.2-0.1-4.7c0-0.9-0.1-1.8-0.1-2.8c0-0.9-0.1-1.8-0.1-2.7  c-0.1-1.1-0.1-2.2-0.2-3.3c0-0.7-0.1-1.4-0.1-2.1c-0.1-1.2-0.2-2.4-0.3-3.6c0-0.5-0.1-1.1-0.1-1.6c-0.1-1.3-0.3-2.6-0.4-4  c0-0.3-0.1-0.7-0.1-1C474.3,113.2,375.7,22.9,256,22.9S37.7,113.2,24.5,229.5c0,0.3-0.1,0.7-0.1,1c-0.1,1.3-0.3,2.6-0.4,4  c-0.1,0.5-0.1,1.1-0.1,1.6c-0.1,1.2-0.2,2.4-0.3,3.6c0,0.7,0.1,1.4,0.1,2.1c0.1,1.1,0.1,2.2,0.2,3.3c0,0.9,0.1,1.8,0.1,2.7c0.1,1.1,0.1,2.2,0.2,3.3c0,0.7,0.1,1.4,0.1,2.1c0.1,1.2,0.2,2.4,0.3,3.6  c0,0.5,0.1,1.1,0.1,1.6c0.1,1.3,0.3,2.6,0.4,4c0,0.3,0.1,0.7,0.1,1C37.7,398.8,136.3,489.1,256,489.1s218.3-90.3,231.5-206.5  c0-0.3,0.1-0.7,0.1-1c0.1-1.3,0.3-2.6,0.4-4c0.1-0.5,0.1-1.1,0.1-1.6c0.1-1.2,0.2-2.4,0.3-3.6c0-0.7,0.1-1.4,0.1-2.1  c0.1-1.1,0.1-2.2,0.2-3.3c0-0.9,0.1-1.8,0.1-2.7c0-0.9,0.1-1.8,0.1-2.8c0-1.6,0.1-3.2,0.1-4.7c0-0.2,0-0.5,0-0.7  C489,256,489,256,489,255.9C489,256,489,256,489,255.9z"/>
                <g>
                  <line fill="none" stroke="#FFFFFF" stroke-width="30" stroke-miterlimit="10" x1="213.6" x2="369.7" y1="344.2" y2="188.2"/>
                  <line fill="none" stroke="#FFFFFF" stroke-width="30" stroke-miterlimit="10" x1="233.8" x2="154.7" y1="345.2" y2="266.1"/>
                </g>
              </symbol>
            </defs>
          </svg>

          <div class="container">
            <!-- Drag and Drop Overlay -->
            <div class="drag-drop-overlay" id="drag-drop-overlay">
              <div class="drag-drop-content">
                <div class="drag-drop-icon-wrapper">
                  <svg class="drag-drop-icon" width="32" height="32" viewBox="0 0 72 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g fill="currentColor">
                      <path d="M70.363 44.59C68.6013 43.258 66.0935 43.6017 64.7575 45.3634L46.4995 69.4724C39.73 78.4099 27.0735 80.6284 17.6905 74.5154C12.71 71.2693 9.39359 66.2537 8.37409 60.3904C7.31939 54.3435 8.8819 48.0154 12.6632 43.0234L35.3312 13.0894C39.5773 7.48783 47.5812 6.37853 53.1902 10.6246C58.7879 14.8668 59.8894 22.8746 55.6472 28.4766L50.8425 34.8204L32.6475 58.8434C31.1709 60.7965 28.4366 61.3629 26.5577 60.109C25.5304 59.4215 24.8546 58.3863 24.6515 57.1832C24.4484 55.984 24.7413 54.7887 25.4757 53.8199L43.8707 29.5389C45.2027 27.7772 44.859 25.2694 43.0973 23.9334C41.3356 22.6014 38.8278 22.9452 37.4918 24.7069L19.0968 48.9879C17.0499 51.691 16.1984 55.1637 16.7648 58.5113C17.296 61.6597 18.964 64.4019 21.4914 66.316C21.6945 66.4722 21.9054 66.6207 22.1203 66.7652C27.3781 70.273 34.5073 69.0933 38.6323 64.1441C38.6948 64.0699 38.769 64.0113 38.8276 63.9332L39.0229 63.6714L62.0229 33.3044C68.9291 24.1833 67.1362 11.1484 58.0112 4.23843C48.8979 -2.66387 35.8632 -0.863167 28.9522 8.25793L6.2842 38.1919L5.88967 38.7115C5.8428 38.774 5.81545 38.8404 5.77248 38.9029C1.03418 45.5435 -0.895518 53.8209 0.491282 61.7619C1.77648 69.1252 5.68268 75.5239 11.5693 79.9849C12.1357 80.4146 12.7216 80.8247 13.3232 81.2154C26.2102 89.606 43.5812 86.567 52.8782 74.2974L71.1362 50.1924C72.4721 48.4307 72.1247 45.9221 70.363 44.59Z" />
                    </g>
                  </svg>
                </div>
                <p class="drag-drop-text">Drop files here to add to chat</p>
              </div>
            </div>
            
            <!-- Creation Section -->
            <div class="creation-section">
              <h1 class="creation-title">What should we build?</h1>
              <div class="creation-content">
                <div class="ai_input_field_wrapper">
                  <div class="selected-files-container" id="selected-files-container"></div>
                  <div class="input_container">
                    <div class="input_wrapper" id="ai-input-wrapper">
                      <div class="input_icon_left" id="ai-input-icon">✦</div>
                      <button class="input_upload_button" id="ai-upload-button" title="Upload File">
                        <svg width="16" height="16" viewBox="0 0 72 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g fill="currentColor">
                            <path d="M70.363 44.59C68.6013 43.258 66.0935 43.6017 64.7575 45.3634L46.4995 69.4724C39.73 78.4099 27.0735 80.6284 17.6905 74.5154C12.71 71.2693 9.39359 66.2537 8.37409 60.3904C7.31939 54.3435 8.8819 48.0154 12.6632 43.0234L35.3312 13.0894C39.5773 7.48783 47.5812 6.37853 53.1902 10.6246C58.7879 14.8668 59.8894 22.8746 55.6472 28.4766L50.8425 34.8204L32.6475 58.8434C31.1709 60.7965 28.4366 61.3629 26.5577 60.109C25.5304 59.4215 24.8546 58.3863 24.6515 57.1832C24.4484 55.984 24.7413 54.7887 25.4757 53.8199L43.8707 29.5389C45.2027 27.7772 44.859 25.2694 43.0973 23.9334C41.3356 22.6014 38.8278 22.9452 37.4918 24.7069L19.0968 48.9879C17.0499 51.691 16.1984 55.1637 16.7648 58.5113C17.296 61.6597 18.964 64.4019 21.4914 66.316C21.6945 66.4722 21.9054 66.6207 22.1203 66.7652C27.3781 70.273 34.5073 69.0933 38.6323 64.1441C38.6948 64.0699 38.769 64.0113 38.8276 63.9332L39.0229 63.6714L62.0229 33.3044C68.9291 24.1833 67.1362 11.1484 58.0112 4.23843C48.8979 -2.66387 35.8632 -0.863167 28.9522 8.25793L6.2842 38.1919L5.88967 38.7115C5.8428 38.774 5.81545 38.8404 5.77248 38.9029C1.03418 45.5435 -0.895518 53.8209 0.491282 61.7619C1.77648 69.1252 5.68268 75.5239 11.5693 79.9849C12.1357 80.4146 12.7216 80.8247 13.3232 81.2154C26.2102 89.606 43.5812 86.567 52.8782 74.2974L71.1362 50.1924C72.4721 48.4307 72.1247 45.9221 70.363 44.59Z" />
                          </g>
                        </svg>
                      </button>
                      <textarea
                        rows="7"
                        id="ai-prompt-input"
                        class="prompt_input"
                        placeholder="Describe the analysis you want to build..."
                        autocomplete="off"
                        spellcheck="false"
                      ></textarea>
                      <div class="input_icons_right">
                        <button class="input_action_button" id="ai-submit-button">
                          ▶
                        </button>
                      </div>
                    </div>
                  </div>
                  <div class="deliverable_radio_group_wrapper">
                    <label class="deliverable_label">Final Deliverable</label>
                    <div class="deliverable_radio_group" id="deliverable-radio-group">
                      <label class="deliverable_radio_label">
                        <input type="radio" name="deliverable" value="app" class="deliverable_radio">
                        <span class="deliverable_radio_text">App</span>
                      </label>
                      <label class="deliverable_radio_label">
                        <input type="radio" name="deliverable" value="eda" class="deliverable_radio">
                        <span class="deliverable_radio_text">Exploratory Data Analysis</span>
                      </label>
                      <label class="deliverable_radio_label">
                        <input type="radio" name="deliverable" value="automation" class="deliverable_radio">
                        <span class="deliverable_radio_text">Automation</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div class="creation-actions">
                  <div class="creation-divider">
                    <span>or</span>
                  </div>
                  <div class="creation-buttons">
                    <a class="creation-button" id="new-notebook-link" href="javascript:void(0)" title="Create new notebook in the default working directory" onclick="handleNewSessionClick('notebook');">
                      <div class="creation-button-icon">${notebookIcon}</div>
                      <div class="creation-button-content">
                        <div class="creation-button-title">New blank notebook</div>
                        <div class="creation-button-subtitle">Start with an empty notebook</div>
                      </div>
                    </a>
                    ${
                      process.platform === 'darwin'
                        ? `<a class="creation-button" id="open-file-or-folder-link" href="javascript:void(0)" title="Open a notebook or folder in JupyterLab" onclick="handleNewSessionClick('open');">
                            <div class="creation-button-icon">${openIcon}</div>
                            <div class="creation-button-content">
                              <div class="creation-button-title">Open</div>
                              <div class="creation-button-subtitle">Open a notebook or folder</div>
                            </div>
                          </a>`
                        : `<a class="creation-button" id="open-file-link" href="javascript:void(0)" title="Open a notebook or file in JupyterLab" onclick="handleNewSessionClick('open-file');">
                            <div class="creation-button-icon">${openIcon}</div>
                            <div class="creation-button-content">
                              <div class="creation-button-title">Open File</div>
                              <div class="creation-button-subtitle">Open a notebook or file</div>
                            </div>
                          </a>
                          <a class="creation-button" id="open-folder-link" href="javascript:void(0)" title="Open a folder in JupyterLab" onclick="handleNewSessionClick('open-folder');">
                            <div class="creation-button-icon">${openIcon}</div>
                            <div class="creation-button-content">
                              <div class="creation-button-title">Open Folder</div>
                              <div class="creation-button-subtitle">Open a folder</div>
                            </div>
                          </a>`
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="section-divider">
              <div class="divider-line"></div>
              <span class="divider-text">RECENT PROJECTS</span>
              <div class="divider-line"></div>
            </div>

            <!-- Recent Sessions Section -->
            <div class="content-section">
              <div class="recent-section">
                <table id="recent-sessions-list" class="recent-table">
                  <thead>
                    <tr>
                      <th class="recent-table-header">Name</th>
                      <th class="recent-table-header">Path</th>
                      <th class="recent-table-header"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Recent sessions will be populated here -->
                  </tbody>
                </table>
                <div id="recent-expander" class="recent-expander">
                  <a href="javascript:void(0)" onclick="handleExpandCollapseRecents();">
                    <span id="expand-collapse-text">View all</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div id="notification-panel">
            <div id="notification-panel-message"></div>
            <div id="notification-panel-close" title="Close" onclick="closeNotificationPanel(event)">
              <svg class="close-button" version="2.0">
                <use href="#circle-xmark" />
              </svg>
            </div>
          </div>

          <script>
          const isDarkTheme = ${this._isDarkTheme};
          const notificationPanel = document.getElementById('notification-panel');
          const notificationPanelMessage = document.getElementById('notification-panel-message');
          const notificationPanelCloseButton = document.getElementById('notification-panel-close');
          const recentSessionsList = document.getElementById('recent-sessions-list');
          const recentExpander = document.getElementById('recent-expander');
          const expandCollapseText = document.getElementById('expand-collapse-text');

          // AI Input Field state
          let aiInputValue = '';
          let selectedDeliverable = null;
          let selectedFiles = [];
          const aiPromptInput = document.getElementById('ai-prompt-input');
          const aiSubmitButton = document.getElementById('ai-submit-button');
          const aiInputWrapper = document.getElementById('ai-input-wrapper');
          const aiInputIcon = document.getElementById('ai-input-icon');
          const deliverableRadios = document.querySelectorAll('.deliverable_radio');
          const deliverableRadioGroup = document.getElementById('deliverable-radio-group');
          const selectedFilesContainer = document.getElementById('selected-files-container');

          // Loading circle SVG
          const loadingCircleSVG = \`<svg class="loading-circle" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path 
              d="M8 1C11.866 1 15 4.13401 15 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 8 8"
                to="360 8 8"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </svg>\`;

          function getDeliverableText(deliverable) {
            const deliverableMap = {
              'app': 'an app',
              'eda': 'an exploratory data analysis',
              'automation': 'an automation'
            };
            return deliverableMap[deliverable] || 'an app';
          }

          function getFileIcon(filePath) {
            // Use the same simple file icon for all file types
            return \`<svg width="14" height="14" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 3.414L18.586 9H14a1 1 0 0 1-1-1V3.414z" fill="currentColor"/>
            </svg>\`;
          }

          function getFileName(filePath) {
            // Extract just the filename from the full path
            const parts = filePath.split(/[/\\\\]/);
            return parts[parts.length - 1];
          }

          function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }

          function renderSelectedFiles() {
            if (!selectedFilesContainer) return;
            
            // Clear existing chips
            selectedFilesContainer.innerHTML = '';
            
            // Render each selected file as a chip
            selectedFiles.forEach((filePath, index) => {
              const fileName = getFileName(filePath);
              const icon = getFileIcon(filePath);
              
              const chip = document.createElement('div');
              chip.className = 'selected-file-chip';
              
              // Create icon element
              const iconEl = document.createElement('div');
              iconEl.className = 'selected-file-icon';
              iconEl.innerHTML = icon; // Use innerHTML for SVG
              
              // Create remove button
              const removeButton = document.createElement('div');
              removeButton.className = 'selected-file-remove';
              removeButton.textContent = '×';
              
              // Create name element
              const nameEl = document.createElement('span');
              nameEl.className = 'selected-file-name';
              nameEl.textContent = fileName;
              
              // Assemble chip
              chip.appendChild(iconEl);
              chip.appendChild(removeButton);
              chip.appendChild(nameEl);
              
              // Add remove handler using closure to capture the file path
              removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                // Remove file from array by path (using closure)
                const pathToRemove = filePath;
                selectedFiles = selectedFiles.filter(fp => fp !== pathToRemove);
                // Re-render chips
                renderSelectedFiles();
              });
              
              selectedFilesContainer.appendChild(chip);
            });
          }

          function handleAIInputSubmit(customInput) {
            // Get the user's text input
            const submittedInput = (customInput || aiInputValue || aiPromptInput.value).trim();
            
            if (submittedInput !== '') {
              
              // Set the input value if using a custom input (from example button)
              if (customInput) {
                aiInputValue = customInput;
                aiPromptInput.value = customInput;
              }
              
              // Update UI
              aiInputWrapper.classList.add('generating');
              aiInputIcon.innerHTML = loadingCircleSVG;
              aiPromptInput.placeholder = 'Processing your request...';
              aiPromptInput.disabled = true;
              aiSubmitButton.disabled = true;
              deliverableRadios.forEach(radio => {
                radio.disabled = true;
              });
              if (deliverableRadioGroup) {
                deliverableRadioGroup.style.opacity = '0.6';
                deliverableRadioGroup.style.pointerEvents = 'none';
              }
              
              // Build the final message with user prompt, file paths, and deliverable
              let finalMessage = submittedInput;
              
              // Append file paths if any files were selected
              if (selectedFiles && selectedFiles.length > 0) {
                const filePathsText = selectedFiles.join('\\n');
                finalMessage = finalMessage + '\\n\\nUse these files to complete the task:\\n' + filePathsText;
              }
              
              // Append the deliverable message if one is selected
              if (selectedDeliverable) {
                const deliverableText = getDeliverableText(selectedDeliverable);
                finalMessage += \`\\n\\nThe final deliverable should be \${deliverableText}\`;
              }
              
              // Create a new notebook session with the AI prompt
              // The prompt will be stored in SessionConfig and accessible in JupyterLab
              window.electronAPI.newSession('notebook', finalMessage);
            }
          }

          // Handle deliverable radio button selection (with toggle-off capability)
          deliverableRadios.forEach(radio => {
            radio.addEventListener('click', (e) => {
              // If clicking on an already selected radio, deselect it
              if (radio.checked && selectedDeliverable === radio.value) {
                // Uncheck the radio and clear selection
                // Use setTimeout to ensure this happens after the click event completes
                setTimeout(() => {
                  radio.checked = false;
                  selectedDeliverable = null;
                }, 0);
              }
            });
            
            radio.addEventListener('change', (e) => {
              if (e.target.checked) {
                selectedDeliverable = e.target.value;
              }
            });
          });

          // Set up input event handlers
          if (aiPromptInput) {
            aiPromptInput.addEventListener('input', (e) => {
              e.stopPropagation();
              // Only update aiInputValue if the user is typing (not when we programmatically add file paths)
              // We detect this by checking if the change is from user typing vs our programmatic update
              // For simplicity, we'll just update it - file paths will be tracked separately in selectedFiles
              const textareaValue = e.target.value;
              // Simple heuristic: if textarea doesn't end with a selected file path, it's user typing
              let isUserTyping = true;
              if (selectedFiles.length > 0) {
                // Check if value ends with any selected file path
                isUserTyping = !selectedFiles.some(filePath => {
                  return textareaValue === filePath || textareaValue.endsWith('\\n' + filePath);
                });
              }
              
              if (isUserTyping) {
                // User is typing, update aiInputValue
                // But we need to remove any file paths that might be in there
                let userText = textareaValue;
                // Simple approach: store the whole value, we'll extract user text on submit
                aiInputValue = userText;
              }
              // If it's a file path display, don't update aiInputValue
            });

            aiPromptInput.addEventListener('keydown', (e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAIInputSubmit();
              }
            });
          }

          if (aiSubmitButton) {
            aiSubmitButton.addEventListener('click', (e) => {
              e.stopPropagation();
              handleAIInputSubmit();
            });

            aiSubmitButton.addEventListener('mousedown', (e) => {
              e.stopPropagation();
            });
          }

          const aiUploadButton = document.getElementById('ai-upload-button');
          if (aiUploadButton) {
            aiUploadButton.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                const filePaths = await window.electronAPI.selectFilesForUpload();
                if (filePaths && filePaths.length > 0) {
                  // Store file paths in the selectedFiles array
                  selectedFiles = [...selectedFiles, ...filePaths];
                  // Render file chips
                  renderSelectedFiles();
                  // Focus the textarea
                  aiPromptInput.focus();
                }
              } catch (error) {
                console.error('Error selecting files:', error);
              }
            });

            aiUploadButton.addEventListener('mousedown', (e) => {
              e.stopPropagation();
            });
          }


          function updateRecentSessionList(recentSessions, resetCollapseState) {
            const maxRecentItems = ${maxRecentItems};
            
            // Get table body
            const tbody = recentSessionsList.querySelector('tbody');
            if (!tbody) return;
            
            // Clear table body
            tbody.innerHTML = '';

            let recentSessionCount = 0;

            for (const recentSession of recentSessions) {
              const {isRemote, linkLabel, linkTooltip, linkDetail} = recentSession;
              const row = document.createElement('tr');
              row.classList.add('recent-item');
              if (!isRemote) {
                row.classList.add('recent-item-local');
              }
              row.dataset.sessionIndex = recentSessionCount;
              row.innerHTML = \`
                <td class="recent-item-name-cell">
                  <div class="recent-item-name">\${linkLabel}</div>
                </td>
                <td class="recent-item-path-cell">
                  <div class="recent-item-path">\${linkDetail || ''}</div>
                </td>
                <td class="recent-item-action-cell">
                  <div class="recent-item-delete" title="Remove" onclick="handleRecentSesssionDeleteClick(event)">
                    <svg version="2.0">
                      <use href="#circle-xmark" />
                    </svg>
                  </div>
                </td>
              \`;

              row.addEventListener('click', (event) => {
                if (!event.target.closest('.recent-item-delete')) {
                  handleRecentSessionClick(event);
                }
              });

              tbody.appendChild(row);
              recentSessionCount++;
            }

            if (recentSessionCount === 0) {
              const noHistoryRow = document.createElement('tr');
              noHistoryRow.className = 'no-recent-row';
              noHistoryRow.innerHTML = \`
                <td colspan="3" class="no-recent-cell">
                  <div class="no-recent-message">
                    <div class="no-recent-icon">📊</div>
                    <div class="no-recent-text">No recent sessions</div>
                    <div class="no-recent-subtext">Your recent projects will appear here</div>
                  </div>
                </td>
              \`;
              tbody.appendChild(noHistoryRow);
            }

            // Handle expand/collapse
            resetCollapseState = resetCollapseState || recentSessionCount <= maxRecentItems;

            if (resetCollapseState) {
              if (recentSessionCount > maxRecentItems) {
                recentSessionsList.classList.add('recents-collapsed');
                recentExpander.style.display = 'block';
                
                // Hide items beyond maxRecentItems
                const items = tbody.querySelectorAll('.recent-item:not(.no-recent-row)');
                items.forEach((item, index) => {
                  if (index >= maxRecentItems) {
                    item.style.display = 'none';
                  }
                });
              } else {
                recentSessionsList.classList.remove('recents-collapsed');
                recentSessionsList.classList.remove('recents-expanded');
                recentExpander.style.display = 'none';
              }
            }
          }

          window.electronAPI.onSetRecentSessionList((recentSessions, resetCollapseState) => {
            updateRecentSessionList(recentSessions, resetCollapseState);
          });

          const dragDropOverlay = document.getElementById('drag-drop-overlay');
          let dragCounter = 0;
          
          document.addEventListener('dragenter', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // Check if files are being dragged
            if (event.dataTransfer.types.includes('Files')) {
              dragCounter++;
              if (dragDropOverlay) {
                dragDropOverlay.style.display = 'flex';
              }
            }
          });
          
          document.addEventListener('dragover', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // Check if files are being dragged
            if (event.dataTransfer.types.includes('Files')) {
              if (dragDropOverlay) {
                dragDropOverlay.style.display = 'flex';
              }
            }
          });
          
          document.addEventListener('dragleave', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            dragCounter--;
            if (dragCounter === 0) {
              if (dragDropOverlay) {
                dragDropOverlay.style.display = 'none';
              }
            }
          });
          
          document.addEventListener('drop', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            // Reset counter and hide overlay
            dragCounter = 0;
            if (dragDropOverlay) {
              dragDropOverlay.style.display = 'none';
            }
        
            const files = [];
            for (const file of event.dataTransfer.files) {
              if (file.path) {
                files.push(file.path);
              }
            }

            if (files.length > 0) {
              // Add files to selectedFiles array (same as upload button)
              selectedFiles = [...selectedFiles, ...files];
              // Render file chips
              renderSelectedFiles();
              // Focus the textarea
              aiPromptInput.focus();
            }
          });

          function handleNewSessionClick(type) {
            window.electronAPI.newSession(type);
          }

          function handleRecentSessionClick(event) {
            const item = event.currentTarget.closest('.recent-item');
            if (!item) {
              return;
            }
            const sessionIndex = parseInt(item.dataset.sessionIndex);
            window.electronAPI.openRecentSession(sessionIndex);
          }

          function handleRecentSesssionDeleteClick(event) {
            event.stopPropagation();
            const item = event.currentTarget.closest('.recent-item');
            if (!item) {
              return;
            }
            const sessionIndex = parseInt(item.dataset.sessionIndex);
            window.electronAPI.deleteRecentSession(sessionIndex);
          }

          function handleExpandCollapseRecents() {
            const isCollapsed = recentSessionsList.classList.contains("recents-collapsed");
            const tbody = recentSessionsList.querySelector('tbody');
            if (!tbody) return;
            const items = tbody.querySelectorAll('.recent-item:not(.no-recent-row)');
            
            if (isCollapsed) {
              recentSessionsList.classList.remove("recents-collapsed");
              recentSessionsList.classList.add("recents-expanded");
              expandCollapseText.innerText = "Show less";
              
              // Show all items
              items.forEach(item => {
                item.style.display = '';
              });
            } else {
              recentSessionsList.classList.remove("recents-expanded");
              recentSessionsList.classList.add("recents-collapsed");
              expandCollapseText.innerText = "View all";
              
              // Hide items beyond maxRecentItems
              items.forEach((item, index) => {
                if (index >= ${maxRecentItems}) {
                  item.style.display = 'none';
                }
              });
            }
          }

          function sendMessageToMain(message, ...args) {
            window.electronAPI.sendMessageToMain(message, ...args);
          }

          function showNotificationPanel(message, closable, showSpinner = false, showSuccess = false) {
            
            if (showSpinner) {
              notificationPanelMessage.innerHTML = message + '<div class="loading-spinner"></div>';
            } else if (showSuccess) {
              notificationPanelMessage.innerHTML = '<svg class="notification-icon" version="2.0"><use href="#checkmark-success" /></svg>' + message;
            } else {
              notificationPanelMessage.innerHTML = message;
            }
            notificationPanelCloseButton.style.display = closable ? 'block' : 'none'; 
            notificationPanel.style.display = message === "" ? "none" : "flex";
          }

          function closeNotificationPanel() {
            notificationPanel.style.display = "none";
          }

          function enableLocalServerActions(enable) {
            const serverActionIds = ["new-notebook-link", "new-session-link", "open-file-or-folder-link", "open-file-link", "open-folder-link"];
            serverActionIds.forEach(id => {
              const link = document.getElementById(id);
              if (link) {
                if (enable) {
                  link.classList.remove("disabled");
                } else {
                  link.classList.add("disabled");
                }
              }
            });

            document.querySelectorAll('.creation-button').forEach(button => {
              if (enable) {
                button.classList.remove("disabled");
              } else {
                button.classList.add("disabled");
              }
            });

            document.querySelectorAll('.recent-item-local').forEach(link => {
              if (enable) {
                link.classList.remove("disabled");
              } else {
                link.classList.add("disabled");
              }
            });
          }

          window.electronAPI.onSetNotificationMessage((message, closable) => {
            showNotificationPanel(message, closable);
          });

          window.electronAPI.onEnableLocalServerActions((enable) => {
            enableLocalServerActions(enable);
          });

          window.electronAPI.onInstallBundledPythonEnvStatus((status, detail) => {
            let message = status === 'STARTED' ?
              'Setting up workspace. This might take several minutes.' :
              status === 'CANCELLED' ?
              'Installation cancelled!' :
              status === 'FAILURE' ?
                'Failed to install!' :
              status === 'SUCCESS' ? 'Workspace setup complete. Create a notebook to get started.' : '';
            if (detail) {
              message += \`[\$\{detail\}]\`;
            }

            const showSpinner = status === 'STARTED';
            const showSuccess = status === 'SUCCESS';
            showNotificationPanel(message, status !== 'STARTED', showSpinner, showSuccess);
          });
          </script>
        </body>
      </html>
      `;
  }

  get view(): BrowserView {
    return this._view;
  }

  load() {
    this._view.webContents.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(this._pageSource)}`
    );

    this._viewReady = new Promise<void>(resolve => {
      this._view.webContents.on('dom-ready', () => {
        resolve();
      });
    });

    this.updateRecentSessionList(true);

    this._registry.environmentListUpdated.connect(
      this._onEnvironmentListUpdated,
      this
    );

    this._view.webContents.on('destroyed', () => {
      this._registry.environmentListUpdated.disconnect(
        this._onEnvironmentListUpdated,
        this
      );
    });
    this._onEnvironmentListUpdated();
  }

  enableLocalServerActions(enable: boolean) {
    this._viewReady.then(() => {
      this._view.webContents.send(
        EventTypeRenderer.EnableLocalServerActions,
        enable
      );
    });
  }

  showNotification(message: string, closable: boolean) {
    this._viewReady.then(() => {
      this._view.webContents.send(
        EventTypeRenderer.SetNotificationMessage,
        message,
        closable
      );
    });
  }

  private async _onEnvironmentListUpdated() {
    const installMessage = `
      <div class="warning-message">
        Before you start, we need to set up your workspace. <a class="install-python-button" href="javascript:void(0);" onclick="sendMessageToMain('${EventTypeMain.InstallBundledPythonEnv}')">Get Started</a>
      </div>
    `;
    this._registry
      .getDefaultEnvironment()
      .then(() => {
        // Check if the default environment is the bundled one
        if (!this._registry.isDefaultEnvironmentBundled()) {
          this.enableLocalServerActions(false);
          this.showNotification(installMessage, false);
        } else {
          this.enableLocalServerActions(true);
        }
      })
      .catch(() => {
        this.enableLocalServerActions(false);
        this.showNotification(installMessage, false);
      });
  }

  updateRecentSessionList(resetCollapseState: boolean) {
    const recentSessionList: IRecentSessionListItem[] = [];
    const home = getUserHomeDir();

    for (const recentSession of appData.recentSessions) {
      let sessionItem = '';
      let sessionDetail = '';
      let tooltip = '';
      let parent = '';
      if (recentSession.remoteURL) {
        const url = new URL(recentSession.remoteURL);
        sessionItem = url.origin;
        tooltip = `${recentSession.remoteURL}\nSession data ${
          recentSession.persistSessionData ? '' : 'not '
        }persisted`;
        sessionDetail = '';
      } else {
        // local
        if (recentSession.filesToOpen.length > 0) {
          sessionItem = path.basename(recentSession.filesToOpen[0]);
          tooltip = recentSession.filesToOpen.join(', ');
          parent = recentSession.workingDirectory;
        } else {
          sessionItem = path.basename(recentSession.workingDirectory);
          parent = path.dirname(recentSession.workingDirectory);
          tooltip = recentSession.workingDirectory;
        }

        if (parent.startsWith(home)) {
          const relative = path.relative(home, parent);
          sessionDetail = `~${path.sep}${relative}`;
        } else {
          sessionDetail = parent;
        }
      }

      recentSessionList.push({
        isRemote: !!recentSession.remoteURL,
        linkLabel: sessionItem,
        linkTooltip: tooltip,
        linkDetail: sessionDetail
      });
    }

    this._viewReady.then(() => {
      this._view.webContents.send(
        EventTypeRenderer.SetRecentSessionList,
        recentSessionList,
        resetCollapseState
      );
    });
  }

  private _isDarkTheme: boolean;
  private _view: BrowserView;
  private _viewReady: Promise<void>;
  private _registry: IRegistry;
  private _pageSource: string;
}

export namespace WelcomeView {
  export interface IOptions {
    isDarkTheme: boolean;
    registry: IRegistry;
  }
}
