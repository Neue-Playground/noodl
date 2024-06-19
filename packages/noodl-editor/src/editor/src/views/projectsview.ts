import { filesystem, platform } from '@noodl/platform';

import { DialogLayerModel } from '@noodl-models/DialogLayerModel';
import { LessonsProjectsModel } from '@noodl-models/LessonsProjectModel';
import { NeueService } from '@noodl-models/NeueServices/NeueService';
import { CloudServiceMetadata } from '@noodl-models/projectmodel';
import { setCloudServices } from '@noodl-models/projectmodel.editor';
import { fetchTemplateFromCloud } from '@noodl-utils/exporter/cloudSyncFunctions';
import { LocalProjectsModel, ProjectItem } from '@noodl-utils/LocalProjectsModel';

import { EventDispatcher } from '../../../shared/utils/EventDispatcher';
import View from '../../../shared/view';
import LessonTemplatesModel from '../models/lessontemplatesmodel';
import TutorialsModel from '../models/tutorialsmodel';
import CloudFormation from '../utils/cloudformation';
import { templateRegistry } from '../utils/forge';
import { tracker } from '../utils/tracker';
import { timeSince } from '../utils/utils';
import { getLessonsState } from './projectsview.lessonstate';
import { ToastLayer } from './ToastLayer/ToastLayer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ProjectsViewTemplate = require('../templates/projectsview.html');

// Styles
require('../styles/projectsview.css');
require('../styles/projectsview.lessoncards.css');

const _cache = {};

type ProjectItemScope = {
  project: ProjectItem;
  label: string;
  latestAccessedTimeAgo: string;
  firmware: string;
  isCloud: boolean;
  cloudVersion: number;
};
const neueTemplate = {
  iconURL:
    'data:image/png;base64,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ESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIAAJQRIAAAQBkBAgAAlBEgAABAGQECAACUESAAAEAZAQIA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AABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBGgAAAAGUECAAAUEaAAAAAZQQIAABQRoAAAABlBAgAAFBG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',
  title: 'Neue project',
  desc: 'A simple application template for Neue playground',
  category: 'Neue',
  projectURL: '20c77d05-8092-8da0-ccf9-6a16367f2e36',

  useCloudServices: false,
  cloudServicesTemplateURL:
    'https://shthy94udd.execute-api.eu-west-1.amazonaws.com/dev2/project/20c77d05-8092-8da0-ccf9-6a16367f2e36'
};
export class ProjectsView extends View {
  _popupLayerElem = null;
  lessonTemplatesModel: LessonTemplatesModel;
  lessonProjectsModel: LessonsProjectsModel;
  projectsModel: LocalProjectsModel;
  tutorialsModel: TutorialsModel;
  from: TSFixme;

  private _backgroundUpdateTimeout: TSFixme;
  private _backgroundUpdateListener: () => void;
  selectedTutorialCategory: TSFixme;
  currentBigFeedItem: TSFixme;
  selectedProjectTemplate: TSFixme;
  projectTemplateLongDesc: TSFixme;
  isRenamingProject: boolean;
  projectFilter: TSFixme;

  constructor({ from }: { from: string }) {
    super();

    this.lessonTemplatesModel = LessonTemplatesModel.instance;
    this.lessonProjectsModel = new LessonsProjectsModel();
    this.projectsModel = LocalProjectsModel.instance;
    this.tutorialsModel = new TutorialsModel();
    this.from = from;

    this.attachBackgroundUpdateListener();
  }

  attachBackgroundUpdateListener() {
    this._backgroundUpdateListener = () => {
      if (!this._backgroundUpdateTimeout) {
        this._backgroundUpdateTimeout = setTimeout(async () => {
          await this.projectsModel.fetch();
          this._backgroundUpdateTimeout = undefined;
        }, 3000);
      }
    };

    document.addEventListener('mousemove', this._backgroundUpdateListener);
  }

  dispose() {
    document.removeEventListener('mousemove', this._backgroundUpdateListener);
    clearTimeout(this._backgroundUpdateTimeout);
    this._backgroundUpdateTimeout = undefined;

    this.projectsModel.off(this);

    this.lessonTemplatesModel.off(this);
    this.lessonProjectsModel.off(this);
  }

  render() {
    this.el = this.bindView($(ProjectsViewTemplate), this);

    this.showSpinner();
    this.projectsModel.fetch().then(() => this.hideSpinner());

    // Lesson items
    // this.renderLessonItems();
    this.lessonTemplatesModel.on(
      ['templatesChanged'],
      () => {
        this.renderTutorialItems();
      },
      this
    );
    this.lessonProjectsModel.on(
      'lessonProgressChanged',
      () => {
        this.renderTutorialItems();
      },
      this
    );

    // Project items
    this.renderProjectItemsPane();

    this.projectsModel.on('myProjectsChanged', () => this.renderProjectItemsPane(), this);

    this.switchPane('projects');

    // this.$('#top-bar').css({ height: this.topBarHeight + 'px' });
    // this.$('#projects-header').css({ top: this.topBarHeight + 'px' });
    this.$('#search').on('keyup', this.onProjectsSearchChanged.bind(this));

    return this.el;
  }

  switchPane(pane) {
    const panes = ['start', 'learn', 'projects'];

    /* if (this.isShowingAdminSettings) {
      this.hideAdminSettings();
    }*/
    panes.forEach((p) => {
      if (pane === p) {
        this.$('#' + p + 'PaneTab').addClass('projects-header-tab-selected');
        this.$('#' + p + 'Pane').show();
      } else {
        this.$('#' + p + 'PaneTab').removeClass('projects-header-tab-selected');
        this.$('#' + p + 'Pane').hide();
      }
    });
  }

  // Start or resume a lesson
  onLessonItemClicked(scope) {
    const _this = this;
    const activityId = 'starting-lesson';

    ToastLayer.showActivity('Starting lesson', activityId);

    this.lessonProjectsModel.loadLessonProject(
      scope.template,
      function (project) {
        ToastLayer.hideActivity(activityId);

        if (!project) {
          ToastLayer.showError("Couldn't load project.");
          return;
        }

        _this.notifyListeners('projectLoaded', project);
      },
      function (progress) {
        ToastLayer.showProgress('Starting lesson', (progress.progress / progress.total) * 100, activityId);
      }
    );
  }
  // Restart a lesson
  onRestartLessonItemClicked(scope, el, evt) {
    const _this = this;
    const activityId = 'restart-lesson';

    ToastLayer.showActivity('Restarting lesson', activityId);

    this.lessonProjectsModel.restartLessonProject(
      scope.template,
      function (project) {
        ToastLayer.hideActivity(activityId);

        if (!project || project.result === 'failure') {
          ToastLayer.showError('Could not restart lesson');
          return;
        }

        _this.notifyListeners('projectLoaded', project);
      },
      function (progress) {
        ToastLayer.showProgress('Restarting lesson', (progress.progress / progress.total) * 100, activityId);
      }
    );

    evt.stopPropagation();
    evt.preventDefault();
  }
  renderProjectItemsPane() {
    const localProjects = this.projectsModel.getProjects();

    this.$('#local-projects').css({ display: localProjects.length ? 'initial' : 'none' });
    this.renderProjectItems({
      items: localProjects,
      appendProjectItemsTo: '.local-projects-items',
      filter: this.projectFilter
    });

    this.$('#no-projects').css({
      display: localProjects.length == 0 ? 'initial' : 'none'
    });

    // Render project template items (basic)
    templateRegistry.list({}).then((templates) => {
      this.$('.projects-create-from-template').html('');
      if (templates) {
        // Sort templates into categories
        const cel = this.bindView(this.cloneTemplate('projects-template-category'), {
          label: 'Basic',
          templates: [neueTemplate]
        });
        this.$('.projects-create-from-template').append(cel);
        const el = this.bindView(this.cloneTemplate('projects-template-item'), neueTemplate);

        neueTemplate.iconURL &&
          this._downloadImageAsURI(neueTemplate.iconURL, function (uri) {
            el.find('.feed-item-image').css('background-image', 'url(' + uri + ')');
          });

        View.$(cel, '.templates').append(el);

        const categories = [];
        templates.forEach((t) => {
          let c = categories.find((c) => c.label === t.category);
          if (c === undefined) {
            c = { label: t.category, templates: [] };
            categories.push(c);
          }
          c.templates.push(t);
        });

        categories.forEach((c) => {
          const cel = this.bindView(this.cloneTemplate('projects-template-category'), c);
          this.$('.projects-create-from-template').append(cel);

          c.templates.forEach((i) => {
            if (i.type !== undefined) return; // Only basic types

            const el = this.bindView(this.cloneTemplate('projects-template-item'), i);

            i.iconURL &&
              this._downloadImageAsURI(i.iconURL, function (uri) {
                el.find('.feed-item-image').css('background-image', 'url(' + uri + ')');
              });

            View.$(cel, '.templates').append(el);
          });
        });
      }
    });

    //  const cel = this.bindView(this.cloneTemplate('projects-template-category'), c);

    // Always start at lessons
    this.selectedTutorialCategory = 'Lessons';

    // Render tutorials
    this.tutorialsModel.list((items) => {
      this.renderTutorialItems();
    });

    // Create new project popup
    this.$('#create-new-project-from-feed-item-name').on('keyup', () => {
      const val = this.$('#create-new-project-from-feed-item-name').val();
      this.$('#create-new-project-button').prop('disabled', val === undefined || val === '');
    });

    // Import project popup
    this.$('#import-existing-project-name').on('keyup', () => {
      const val = this.$('#import-existing-project-name').val();
      this.$('#import-new-project-button').prop('disabled', val === undefined || val === '');
    });
  }
  _getTutorialCategories() {
    const lessonCategories = this.lessonTemplatesModel.getCategories();
    const tutorialCategories = this.tutorialsModel.getCategories();

    const allCategories = Array.from(new Set(lessonCategories.concat(tutorialCategories)));
    return allCategories;
  }

  renderProjectItems(options: {
    items?: ProjectItem[];
    appendProjectItemsTo?: string;
    filter?: string;
    template?: string;
  }) {
    options = options || {};

    const items = options.items;
    const projectItemsSelector = options.appendProjectItemsTo || '.projects-items';
    const template = options.template || 'projects-item';
    this.$(projectItemsSelector).html('');

    for (const i in items) {
      const label = items[i].name;
      if (options.filter && label.toLowerCase().indexOf(options.filter) === -1) continue;

      const latestAccessed = items[i].latestAccessed || Date.now();

      const scope: ProjectItemScope = {
        project: items[i],
        label: label,
        latestAccessedTimeAgo: timeSince(latestAccessed) + ' ago',
        isCloud: items[i].isCloud,
        firmware: items[i].firmware,
        cloudVersion: items[i].cloudVersion
      };

      const el = this.bindView(this.cloneTemplate(template), scope);

      if (items[i].isCloud) {
        const img = el.find('#isCloud');
        img.show();
      }
      if (items[i].thumbURI) {
        // Set the thumbnail image if there is one
        View.$(el, '.projects-item-thumb').css('background-image', 'url(' + items[i].thumbURI + ')');
      } else {
        // No thumbnail, show cloud download icon
        View.$(el, '.projects-item-cloud-download').show();
      }

      this.$(projectItemsSelector).append(el);
    }
  }

  renderTutorialItems() {
    // Render categories
    const categories = this._getTutorialCategories();

    this.$('.tutorial-categories').html('');

    if (categories.length > 1) {
      for (const category of categories) {
        const el = this.bindView(this.cloneTemplate('tutorial-category-item'), {
          name: category,
          selected: this.selectedTutorialCategory === category
        });

        this.$('.tutorial-categories').append(el);
      }
    }

    const lessons = this.lessonTemplatesModel
      .getTemplates()
      .filter((lesson) => lesson.category === this.selectedTutorialCategory);

    const categoryHasLessons = lessons.length > 0;

    this.$('.tutorial-items').html('');
    if (categoryHasLessons) {
      this.$('#lesson-items-scroll-controls-left').attr('class', 'disabled');
      this.$('#lesson-items-scroll-controls-right').attr('class', '');
      this.$('.tutorial-items')
        .off('scroll')
        .on('scroll', (e) => {
          this.$('#lesson-items-scroll-controls-left').attr('class', e.target.scrollLeft > 0 ? '' : 'disabled');
          const canScrollRight = e.target.scrollLeft + e.target.clientWidth < e.target.scrollWidth;
          this.$('#lesson-items-scroll-controls-right').attr('class', canScrollRight ? '' : 'disabled');
        });
    }

    this.$('.lesson-items-scroll-controls').css('display', categoryHasLessons ? 'flex' : 'none');

    if (categoryHasLessons) {
      this.$('.tutorial-items').addClass('with-lessons');
    } else {
      this.$('.tutorial-items').removeClass('with-lessons');
    }

    //start by adding lessons, then tutorial cards
    //1. lessons
    const lessonProgress = lessons.map(
      (l) => this.lessonProjectsModel.getLessonProjectProgress(l.name) || { index: 0, end: 0 }
    );

    const lessonStates = getLessonsState(lessonProgress);

    lessons.forEach((lesson, index) => {
      const state = lessonStates[index];

      let buttonText = 'Start lesson';
      if (state.name === 'in-progress') {
        buttonText = 'Continue lesson';
      } else if (state.name === 'completed') {
        buttonText = 'Open lesson';
      }

      const el = this.bindView(this.cloneTemplate('tutorial-lesson-item'), {
        template: lesson,
        showRestart: state.progressPercent > 0,
        buttonText,
        completionText: state.progressPercent + '%',
        completed: state.name === 'completed',
        isFeatureHighlight: lesson?.type === 'highlight'
      });

      el.addClass(state.name);
      if (state.isNextUp) {
        el.addClass('next-up');
      }

      const imageUrl = this.tutorialsModel.absoluteUrl(lesson.thumb);
      el.find('.projects-tutorial-item-thumb').attr('srcset', imageUrl + ' 2x');

      const badgeUrl = this.tutorialsModel.absoluteUrl(lesson.completionBadge);
      el.find('.projects-lesson-item-badge').attr('srcset', badgeUrl + ' 2x');

      el.find('.progress').css({ width: state.progressPercent + '%' });
      this.$('.tutorial-items').append(el);
    });

    const tutorials = this.tutorialsModel.tutorials.filter((t) => t.category === this.selectedTutorialCategory);

    //2. tutorial cards
    for (const item of tutorials) {
      const el = this.bindView(this.cloneTemplate('tutorial-item'), item);
      const imageUrl = this.tutorialsModel.absoluteUrl(item.thumb);
      el.find('.projects-tutorial-item-thumb').attr('srcset', imageUrl + ' 2x');
      this.$('.tutorial-items').append(el);
    }
  }
  _getLessonScrollState() {
    const parentRect = this.$('.tutorial-items').get(0).getBoundingClientRect();

    const lessonDivs: HTMLDivElement[] = Array.from(this.$('.tutorial-items').get(0).children);
    const rects = lessonDivs.map((child) => child.getBoundingClientRect());

    const scrollIndex = Math.max(
      0,
      rects.findIndex(({ left }) => left >= parentRect.left)
    );

    const itemSize = rects[0].width + 10;
    const itemsPerPage = Math.floor(parentRect.width / itemSize);

    return {
      scrollIndex,
      itemsPerPage,
      lessonDivs
    };
  }
  onLessonsScrollLeftClicked() {
    const { scrollIndex, itemsPerPage, lessonDivs } = this._getLessonScrollState();
    const targetIndex = Math.max(0, scrollIndex - itemsPerPage);

    lessonDivs[targetIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  }
  onLessonsScrollRightClicked() {
    const { scrollIndex, itemsPerPage, lessonDivs } = this._getLessonScrollState();
    const targetIndex = Math.min(lessonDivs.length - 1, Math.max(0, scrollIndex + itemsPerPage));

    lessonDivs[targetIndex].scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  }

  onTutorialCategoryClicked(scope) {
    this.selectedTutorialCategory = scope.name;
    this.renderTutorialItems();
  }
  onTutorialItemClicked(scope) {
    tracker.track('Tutorial Card Clicked', {
      label: scope.label,
      url: scope.url
    });
    platform.openExternal(this.tutorialsModel.absoluteUrl(scope.url));
  }
  _downloadImageAsURI(url, callback) {
    if (_cache[url]) {
      if (_cache[url].isCompleted) return callback(_cache[url].uri);
      else return _cache[url].waiting.push(callback);
    }

    _cache[url] = {
      waiting: [callback]
    };

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'image/*');
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
      _cache[url].isCompleted = true;

      if (this.status === 200) {
        _cache[url].uri = URL.createObjectURL(this.response);
        _cache[url].waiting.forEach((c) => c(_cache[url].uri));
      } else _cache[url].waiting.forEach((c) => c());
    };
    xhr.onerror = function () {
      callback();
    };
    xhr.responseType = 'blob';
    xhr.send();
  }
  _downloadVideoAsURI(url, callback) {
    if (_cache[url]) {
      if (_cache[url].isCompleted) return callback(_cache[url].uri);
      else return _cache[url].waiting.push(callback);
    }

    _cache[url] = {
      waiting: [callback]
    };

    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'video/*');
    xhr.responseType = 'blob';
    xhr.onload = function (e) {
      _cache[url].isCompleted = true;

      if (this.status === 200) {
        _cache[url].uri = URL.createObjectURL(this.response);
        _cache[url].waiting.forEach((c) => c(_cache[url].uri));
      } else _cache[url].waiting.forEach((c) => c());
    };
    xhr.onerror = function () {
      callback();
    };
    xhr.responseType = 'blob';
    xhr.send();
  }

  onExitBigFeedItemClicked(scope) {
    this.$('#start-pane-feed-big').hide();
  }

  onCreateNewProjectClicked() {
    this.$('.projects-create-new-project').show();
    //enable scrolling on the entire parent pane so the templates can be scrolled
    //TODO: clean this up so no JS is required to scroll
    this.$('#projectsPane').css({ overflowY: 'auto' });

    this.$('.projects-list').hide();
  }

  onBackToProjectsListClicked() {
    this.$('.projects-create-new-project').hide();
    this.$('.projects-import-existing-project').hide();
    this.$('.projects-list').show();
    this.$('#projectsPane').css({ overflowY: '' });
  }

  async onImportExistingProjectClicked() {
    const direntry = await filesystem.openDialog({
      allowCreateDirectory: false
    });

    if (!direntry) return;

    const activityId = 'opening-project';

    ToastLayer.showActivity('Opening project', activityId);

    try {
      const project = await this.projectsModel.openProjectFromFolder(direntry);

      if (!project.name) {
        project.name = filesystem.basename(direntry);
      }

      this.notifyListeners('projectLoaded', project);
    } catch (e) {
      ToastLayer.showError('Could not open project');
    } finally {
      ToastLayer.hideActivity(activityId);
    }
  }

  async onImportProjectFromCloudClicked() {
    EventDispatcher.instance.notifyListeners('import-neue-cloud-open');
  }

  onRenameProjectClicked(scope: ProjectItemScope, el, evt) {
    const input = el.parents('.projects-item').find('#project-name-input');
    const container = el.parents('.projects-item').find('#project-name');
    const img = el.find('#isCloud');
    img.hide();

    input.val(scope.label);
    container.show();

    this.isRenamingProject = true;

    input.off('blur').on('blur', () => {
      container.hide();

      //hack to make sure this isn't set to false before the click event
      //on the project item has had a chance to see this flag (blur comes before click)
      setTimeout(() => {
        img.show();
        this.isRenamingProject = false;
      }, 100);

      const newName = input.val();
      if (newName !== scope.label) {
        this.projectsModel.renameProject(scope.project.id, input.val());
      }
    });

    input.off('keyup').on('keyup', (e) => {
      if (e.keyCode === 13) {
        input.blur();
      }
    });

    input.off('click').on('click', (e) => {
      e.stopPropagation();
    });

    input.focus();
    evt.stopPropagation();
  }

  onProjectsSearchChanged() {
    const filter = this.$('#search').val();
    this.projectFilter = filter === '' ? undefined : filter.toLowerCase();
    this.renderProjectItemsPane();
  }

  // Launch a project from the recent list
  async onProjectItemClicked(scope: ProjectItemScope, el) {
    if (this.isRenamingProject) {
      const input = el.find('#project-name-input');
      input.blur();
      return;
    }
    EventDispatcher.instance.on(
      'check-cloud-version-open-project',
      () => {
        this.openProject(scope, el);
        EventDispatcher.instance.off(this);
      },
      this
    );
    const activityId = 'opening-project';

    ToastLayer.showActivity('Opening project', activityId);
    if (scope.isCloud) {
      NeueService.instance
        .fetchProject(scope.project.id)
        .then(async (res) => {
          const config = JSON.parse(res[1]);

          if (config.cloudVersion > scope.cloudVersion) {
            ToastLayer.hideActivity(activityId);
            EventDispatcher.instance.notifyListeners('check-cloud-version-import-project-open', {
              project: scope.project,
              action: 'open'
            });
          } else {
            EventDispatcher.instance.notifyListeners('check-cloud-version-open-project');
          }
        })
        .catch(async (err) => {
          ToastLayer.hideActivity(activityId);
          ToastLayer.showError(err ? err : 'Something went wrong while trying to sync to cloud');
          EventDispatcher.instance.notifyListeners('check-cloud-version-open-project');
        });
    } else {
      this.openProject(scope, el);
    }
    return;
  }

  async openProject(scope: ProjectItemScope, el) {
    const activityId = 'opening-project';
    const project = await this.projectsModel.loadProject(scope.project);
    ToastLayer.hideActivity(activityId);
    if (!project) {
      ToastLayer.showError("Couldn't load project.");
      return;
    }
    this.notifyListeners('projectLoaded', project);
  }

  onDeleteProjectClicked(scope: ProjectItemScope, el, evt) {
    evt.stopPropagation();

    DialogLayerModel.instance.showConfirm({
      title: 'Remove project ' + scope.project.name + '?',
      text: 'Do you want to remove the project from the list? Note that the project folder is still left intact, and can be opened again',
      onConfirm: () => this.projectsModel.removeProject(scope.project.id)
    });
  }

  // Import a project from a URL
  importFromUrl(uri) {
    // Extract and remove query from url
    const query = {} as any;
    if (uri.indexOf('?') !== -1) {
      // Has query string
      const queryStr = uri.split('?')[1];
      queryStr.split('&').forEach((pair) => {
        pair = pair.split('=');
        query[pair[0]] = pair[1];
      });

      uri = uri.substring(0, uri.indexOf('?'));
    }

    const iconURL = query.thumb;
    const defaultProjectName = query.name !== undefined ? decodeURIComponent(query.name) : '';

    this.currentBigFeedItem = {
      projectURL: uri,
      useCloudServices: query.cf !== undefined,
      cloudServicesTemplateURL: query.cf !== undefined ? decodeURIComponent(query.cf) : undefined,
      title: defaultProjectName
    };
    this.projectTemplateLongDesc = '';

    if (iconURL !== undefined)
      this._downloadImageAsURI(decodeURIComponent(iconURL), (uri) => {
        this.$('#start-pane-feed-item-big-image').css('background-image', 'url(' + uri + ')');
      });

    this.$('#create-new-project-button').prop(
      'disabled',
      defaultProjectName === undefined || defaultProjectName === ''
    );
    this.$('#create-new-project-from-feed-item-name').val(defaultProjectName || '');
    this.$('#start-pane-feed-item-big-content').hide();
    this.$('#start-pane-feed-item-big-create-new-project').show();

    this.$('#start-pane-feed-big').show();
  }

  onSelectTemplateClicked(scope) {
    const _this = this;
    //this.selectedProjectTemplate = scope;
    this.currentBigFeedItem = scope;
    this.projectTemplateLongDesc = scope.desc;

    this._downloadImageAsURI(scope.iconURL, function (uri) {
      _this.$('#start-pane-feed-item-big-image').css('background-image', 'url(' + uri + ')');
    });

    // this._setupCloudServicesSelection(scope);
    this.$('#create-new-project-from-feed-item-name').val(scope.defaultProjectName || '');
    this.$('#start-pane-feed-item-big-content').hide();
    this.$('#start-pane-feed-item-big-create-new-project').show();

    this.$('#create-new-project-button').prop(
      'disabled',
      scope.defaultProjectName === undefined || scope.defaultProjectName === ''
    );
    this.$('#start-pane-feed-big').show();

    this.$('#create-new-project-from-feed-item-name').focus();
  }

  async onNewProjectFromSampleClicked() {
    const projectTemplate = this.currentBigFeedItem;
    if (!projectTemplate) return;
    if (!projectTemplate.projectURL) return;

    let direntry;
    try {
      direntry = await filesystem.openDialog({
        allowCreateDirectory: true
      });
    } catch (e) {
      return;
    }
    const activityId = 'creating-project';
    ToastLayer.showActivity('Creating new project', activityId);

    const name = this.$('#create-new-project-from-feed-item-name').val() || 'Untitled';
    const firmware = this.$('#create-new-project-from-feed-item-firmware').val() || 'Untitled';

    const path = filesystem.makeUniquePath(filesystem.join(direntry, name));

    const options = {
      name,
      firmware,
      path,
      projectTemplate: projectTemplate.projectURL,
      isNeue: projectTemplate.category === 'Neue'
    };

    async function _prepareCloudServices(): Promise<CloudServiceMetadata> {
      const cloudServices = {
        name: projectTemplate.title + ' cloud services',
        desc: 'Cloud services created for the ' + projectTemplate.title + ' project template'
      };

      const cf = new CloudFormation();

      return new Promise((resolve, reject) => {
        cf.setup({
          templateUrl: projectTemplate.cloudServicesTemplateURL,
          cloudServices: cloudServices,
          success: resolve,
          error: reject
        });
      });
    }
    if (projectTemplate.category === 'Neue') {
      const res = await fetchTemplateFromCloud(path, projectTemplate.projectURL, name);
      ToastLayer.hideActivity(activityId);
      this.notifyListeners('projectLoaded', res);
    } else {
      this.projectsModel.newProject(async (project) => {
        if (!project) {
          ToastLayer.hideActivity(activityId);
          ToastLayer.showError('Could not create new project.');
          this.$('#start-pane-feed-item-big-create-new-project').hide();
          this.$('#start-pane-feed-big').hide();
          return;
        }

        // Project is create, now setup cloud services
        if (projectTemplate.useCloudServices) {
          try {
            // Refresh the cloud services acccess token so it's ready for the cloud formation
            const cloudServices = await _prepareCloudServices();
            ToastLayer.hideActivity(activityId);
            if (projectTemplate.useCloudServices && cloudServices === undefined) {
              ToastLayer.showError('Failed to setup cloud services.');
              return;
            }

            setCloudServices(project, cloudServices);
            this.notifyListeners('projectLoaded', project);
          } catch (e) {
            ToastLayer.hideActivity(activityId);
            ToastLayer.showError('Failed to create cloud services for project.');
          }
        }

        ToastLayer.hideActivity(activityId);

        tracker.track('Create New Project', {
          templateLabel: projectTemplate.title,
          templateUrl: projectTemplate.projectURL
        });

        this.notifyListeners('projectLoaded', project);
      }, options);
    }
  }

  showSpinner() {
    if (!this.el) return;

    this.$('.page-spinner').show();
  }

  hideSpinner() {
    if (!this.el) return;

    this.$('.page-spinner').hide();
  }
}
