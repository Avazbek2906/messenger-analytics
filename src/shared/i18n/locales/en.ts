import type { Messages } from './uz'

/** English. Keys are checked against `Messages` — a missing one won't compile. */
export const en: Messages = {
  /* -------------------------------------------------------------- Common */
  'common.retry': 'Try again',
  'common.apply': 'Apply',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.copied': 'Copied',
  'common.noData': 'No data',
  'common.outOf100': '/ 100',

  /* -------------------------------------------------------------- Errors */
  'error.network.title': 'No connection',
  'error.network.description':
    'Could not reach the server. Check your internet connection.',
  'error.noCompany.title': 'Account is not linked to a company',
  'error.noCompany.description':
    'Your account is not attached to any company. Contact your administrator.',
  'error.forbidden.title': 'Access denied',
  'error.forbidden.description':
    'You do not have permission to view this section.',
  'error.notFound.title': 'Not found',
  'error.notFound.description':
    'The requested data does not exist or has been deleted.',
  'error.server.title': 'Server error',
  'error.server.description': 'Something went wrong. Please try again shortly.',
  'error.request.title': 'Request failed',
  'error.unknown.detail': 'Unknown error.',
  'error.unexpected.title': 'Unexpected error',
  'error.unexpected.description': 'Try refreshing the page.',
  'error.app.title': 'The application ran into an error',
  'error.app.description':
    'An unexpected error prevented this page from rendering. Reload the page or try again later.',
  'error.app.reload': 'Reload page',

  /* --------------------------------------------------------------- Login */
  'auth.welcome': 'Welcome back',
  'auth.subtitle': 'Sign in to open your analytics dashboard.',
  'auth.username': 'Username',
  'auth.usernameHint': 'This is not an email — it is your system login.',
  'auth.usernameRequired': 'Enter your username',
  'auth.password': 'Password',
  'auth.passwordRequired': 'Enter your password',
  'auth.showPassword': 'Show password',
  'auth.hidePassword': 'Hide password',
  'auth.submit': 'Sign in',
  'auth.forgot': 'Forgot your password? Contact your company administrator.',
  'auth.error.credentials':
    'Incorrect username or password, or the account is inactive.',
  'auth.error.generic': 'Sign-in failed.',
  'auth.brand.headline': 'Turn your sales conversations {accent}.',
  'auth.brand.headlineAccent': 'into measurable metrics',
  'auth.brand.channels.title': 'Telegram, Instagram and web chat',
  'auth.brand.channels.text':
    'Every sales conversation in one place — observed only, never replied to.',
  'auth.brand.scoring.title': 'AI scoring and rubric',
  'auth.brand.scoring.text':
    'Each conversation gets a 0–100 score, a reason breakdown and a script funnel.',
  'auth.brand.control.title': 'Manager oversight',
  'auth.brand.control.text':
    'Correct the AI, reassign a conversation — every change is audited.',

  /* ---------------------------------------------------------- Navigation */
  'nav.dashboard': 'Dashboard',
  'nav.conversations': 'Conversations',
  'nav.team': 'Team',
  'nav.products': 'Products',
  'nav.agreements': 'Agreements',
  'nav.customers': 'Customers',
  'nav.cabinet': 'My cabinet',
  'nav.reports': 'Reports',
  'nav.settings': 'Settings',
  'nav.main': 'Main navigation',
  'nav.home': 'Messenger Analytics — home',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'nav.expandSidebar': 'Expand sidebar',
  'nav.collapseSidebar': 'Collapse sidebar',
  'nav.skipToContent': 'Skip to main content',

  /* ---------------------------------------------------- Profile and language */
  'user.menu': 'Profile menu',
  'user.signOut': 'Sign out',
  'user.language': 'Language',
  'theme.label': 'Appearance',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',
  'user.switchAccount': 'Sign in with another account',

  'role.owner': 'Owner',
  'role.admin': 'Administrator',
  'role.manager': 'Manager',
  'role.viewer': 'Viewer',

  'attribution.mode1': 'By account',
  'attribution.mode2': 'By shift schedule',
  'attribution.mode3': 'By browser extension',

  /* ------------------------------------------------------- System pages */
  'noCompany.title': 'Account is not linked to a company',
  'noCompany.description':
    '{name} is not attached to any company, so no analytics data is available. Sign in again once an administrator adds you to a company.',
  'noCompany.fallbackName': 'Your account',
  'notFound.title': 'Page not found',
  'notFound.description':
    'The address may be wrong or the section has been moved.',
  'notFound.action': 'Back to dashboard',
  'stub.title': 'This section is being built',
  'stub.description': 'Ships in phase {phase}.',
  'stub.conversations':
    'All closed conversations, filters and score-based sorting.',
  'stub.team': 'Employee league table and department comparison.',
  'stub.products': 'Lost opportunities and customer feedback analysis.',
  'stub.agreements': 'Promises made, kept and forgotten.',
  'stub.customers': 'Per-channel customer identities and merging.',
  'stub.cabinet': 'Your own metrics, strengths and weaknesses.',
  'stub.reports': 'Create and download Excel exports.',
  'stub.settings': 'Company, employees, AI catalog and channel integrations.',

  /* --------------------------------------------------------- Period filter */
  'period.select': 'Select period',
  'period.7d': '7 days',
  'period.30d': '30 days',
  'period.90d': '90 days',
  'period.month': 'This month',
  'period.custom': 'Custom',
  'period.customTitle': 'Custom period',
  'period.pick': 'Pick a custom period',
  'period.from': 'Start',
  'period.to': 'End',
  'period.invalidRange': 'End date cannot be before the start date',
  'period.confirmedOn': 'Confirmed',
  'period.confirmedOff': 'All results',
  'period.confirmedLabel': 'Confirmed results only',
  'period.confirmedDescription':
    'Limits the data to conversations a manager has validated. This narrows coverage; it does not change how anything is calculated.',

  /* --------------------------------------------------------------- Deltas */
  'delta.comparison': 'Versus the preceding period of equal length',
  'delta.comparisonLower': 'Versus the preceding period — lower is better',
  'delta.noBaseline': 'No baseline in the previous period to compare against',

  /* ------------------------------------------------------------ Dashboard */
  'dashboard.subtitle': '{company} — sales conversation quality and outcomes',

  'kpi.conversations': 'Conversations',
  'kpi.conversations.caption': '{count} scored',
  'kpi.conversations.hint':
    'Conversations CLOSED in the selected window. Open ones are excluded — they have no final score.',
  'kpi.avgScore': 'Average score',
  'kpi.avgScore.coverage': 'Coverage: {percent}',
  'kpi.avgScore.coverageUnknown': 'Coverage unknown',
  'kpi.avgScore.hint':
    'The average covers SCORED conversations only. Coverage tells you how many were scored.',
  'kpi.conversion': 'Conversion',
  'kpi.conversion.caption': '{sold} sold · {notSold} not sold',
  'kpi.conversion.hint':
    'sold / (sold + not sold). “Unclear” outcomes are excluded from the denominator.',
  'kpi.firstResponse': 'First response',
  'kpi.firstResponse.caption': 'From the customer message to the reply',
  'kpi.firstResponse.hint':
    'A conversation that was never answered contributes nothing to this average — not zero.',
  'kpi.angry': 'Angry customers',
  'kpi.angry.unassigned': '{count} conversations unassigned',
  'kpi.angry.allAssigned': 'All conversations are assigned',
  'kpi.angry.hint':
    'Conversations where the customer’s closing sentiment was scored as angry.',
  'kpi.agreements': 'Agreements',
  'kpi.agreements.caption': '{fulfilled} kept · {forgotten} forgotten',
  'kpi.agreements.hint':
    'How many promises were made in conversations, and their status.',

  'coverage.none':
    '{count} conversations closed in this window, but none have been scored yet. Quality metrics stay “—” until analysis runs.',
  'coverage.partial':
    '{percent} of conversations are scored ({pending} still awaiting analysis). Quality metrics apply to that coverage.',

  'overview.empty.title': 'No closed conversations in this period',
  'overview.empty.description':
    'Nothing was completed in the selected window. Widen the range or check that a channel is connected.',

  'outcomes.title': 'Outcome breakdown',
  'outcomes.description': '{count} closed conversations',
  'outcomes.center': 'conversion',
  'outcome.sold': 'Sold',
  'outcome.notSold': 'Not sold',
  'outcome.unclear': 'Unclear',
  'outcome.unscored': 'Not scored yet',

  'trend.title': 'Volume and quality trend',
  'trend.description': 'Closed conversations and their average score',
  'trend.granularity': 'Bucket size',
  'trend.day': 'Daily',
  'trend.week': 'Weekly',
  'trend.legend.volume': 'Conversations',
  'trend.legend.score': 'Average score (0–100)',
  'trend.a11y.volume':
    'Conversation volume chart: {count} points, peaking at {max}.',
  'trend.a11y.score': 'Average score chart: lowest {min}, highest {max}.',
  'trend.a11y.scoreEmpty':
    'Average score chart: nothing was scored in this period.',
  'trend.tooLong.title': 'Period is too long',
  'trend.tooLong.description':
    'Daily buckets would produce more than {max} points. Switch to weekly grouping or shorten the range.',
  'trend.tooLong.action': 'Switch to weekly',
  'trend.empty.title': 'No closed conversations in this period',
  'trend.empty.description': 'Try widening the range.',
  'trend.tooltip.weekOf': 'Week of {date}',
  'trend.tooltip.noneScored': 'No conversation was scored in this bucket',

  'criteria.title': 'Rubric profile',
  'criteria.description': 'What to coach next quarter',
  'criteria.samples': 'based on {count} conversations',
  'criteria.samplesHint':
    'Rubric scores come only from the nightly batch analysis, so this number is normally lower than the count of scored conversations.',
  'criteria.average': 'Average',
  'criteria.empty.title': 'Batch analysis has not run yet',
  'criteria.empty.description':
    'Only the nightly full analysis produces rubric sub-scores. This section fills in once conversations are scored.',
  'criteria.strengths': 'Strengths',
  'criteria.weaknesses': 'Weaknesses',
  'criteria.notEnough':
    'Not enough data — this list relies on the batch analysis.',

  'criterion.rule_adherence': 'Rule adherence',
  'criterion.response_speed': 'Response speed',
  'criterion.tone': 'Tone',
  'criterion.needs_discovery': 'Needs discovery',
  'criterion.objection_handling': 'Objection handling',
  'criterion.closing': 'Closing',
  'criterion.promise_fulfillment': 'Promise fulfillment',

  'criterionHint.rule_adherence':
    'How closely the company rules and script were followed.',
  'criterionHint.response_speed': 'How quickly the customer got an answer.',
  'criterionHint.tone': 'Conversational manner and courtesy.',
  'criterionHint.needs_discovery':
    'Questions asked to uncover the customer’s real need.',
  'criterionHint.objection_handling':
    'Quality of the answers to price and other objections.',
  'criterionHint.closing':
    'Whether a concrete next step was set at the end of the conversation.',
  'criterionHint.promise_fulfillment': 'Whether promises made were kept.',

  'funnel.title': 'Script funnel',
  'funnel.description': 'Where in the script conversations break down',
  'funnel.analyzed': '{count} analysed',
  'funnel.empty.title': 'Not enough analysed conversations',
  'funnel.empty.description':
    'The funnel comes only from the nightly full (Pro) analysis. Real-time quick scoring does not identify stages.',
  'funnel.summary': '{success} successful',
  'funnel.summaryDrop': '{percent} drop-off',
  'funnel.tooltip': '{label}: {count} ({percent})',
  'funnel.status.success': 'Successful',
  'funnel.status.neutral': 'Partial',
  'funnel.status.drop_off': 'Drop-off',
  'funnel.status.not_reached': 'Not reached',

  'funnelStage.greeting': 'Greeting',
  'funnelStage.needs_discovery': 'Needs discovery',
  'funnelStage.offer': 'Offer',
  'funnelStage.price': 'Price',
  'funnelStage.objection_handling': 'Objections',
  'funnelStage.closing': 'Closing',

  /* ----------------------------------------------------------- Pagination */
  'pagination.range': '{from}–{to} of {total}',
  'pagination.previous': 'Previous',
  'pagination.next': 'Next',

  /* -------------------------------------------------------- Conversations */
  'conversations.subtitle':
    'Closed conversations, their scores and outcomes. Every row opens the full breakdown.',

  'conversationTable.customer': 'Customer',
  'conversationTable.employee': 'Employee',
  'conversationTable.score': 'Score',
  'conversationTable.outcome': 'Outcome',
  'conversationTable.sentiment': 'Sentiment',
  'conversationTable.firstResponse': 'First response',
  'conversationTable.closedAt': 'Closed',
  'conversationTable.open': 'Open',
  'conversationTable.unassigned': 'Unassigned',
  'conversationTable.unassignedHint':
    'No attribution rule matched — a manager needs to assign this one.',
  'conversationTable.needsReviewHint':
    'The quick and full analysis scores diverged — worth a second look.',
  'conversationTable.total': '{count} total',
  'conversationTable.empty.title': 'No conversations yet',
  'conversationTable.empty.description':
    'Once a channel is connected, conversations show up here automatically.',
  'conversationTable.emptyFiltered.title': 'Nothing matches these filters',
  'conversationTable.emptyFiltered.description':
    'Loosen the filters or reset them and try again.',

  'conversationFilters.search': 'Search conversations',
  'conversationFilters.searchPlaceholder': 'Customer name or username',
  'conversationFilters.clearSearch': 'Clear search',
  'conversationFilters.more': 'Filters',
  'conversationFilters.reset': 'Reset',
  'conversationFilters.any': 'Any',
  'conversationFilters.ordering': 'Sort',
  'conversationFilters.employee': 'Employee',
  'conversationFilters.outcome': 'Outcome',
  'conversationFilters.sentiment': 'Sentiment',
  'conversationFilters.attribution': 'Attribution',
  'conversationFilters.product': 'Product',
  'conversationFilters.reason': 'Reason',
  'conversationFilters.scoreRange': 'Score range',
  'conversationFilters.scoreRangeHint': '0 to 100',
  'conversationFilters.scoreMax': 'Maximum score',
  'conversationFilters.closedRange': 'Closed between',
  'conversationFilters.closedTo': 'Closed — end date',
  'conversationFilters.unassigned': 'Unassigned',
  'conversationFilters.needsReview': 'Needs review',
  'conversationFilters.hasViolations': 'Has violations',

  'ordering.lastMessageDesc': 'By last message',
  'ordering.closedDesc': 'Recently closed first',
  'ordering.closedAsc': 'Oldest closed first',
  'ordering.scoreDesc': 'Score: high to low',
  'ordering.scoreAsc': 'Score: low to high',
  'ordering.startedDesc': 'Recently started first',

  /* --------------------------------------------------- Conversation detail */
  'conversation.backToList': 'Back to conversations',
  'conversation.employee': 'Employee',
  'conversation.outcome': 'Outcome',
  'conversation.score': 'Score',
  'conversation.reason': 'Reason',
  'conversation.legacy': 'Archive',
  'conversation.startedAt': 'Started',
  'conversation.closedAt': 'Closed',
  'conversation.avgResponse': 'Average response',
  'conversation.aiSaid': 'AI:',
  'conversation.notScoredHint': 'Not scored yet — this is not a zero.',
  'conversation.noReasonHint': 'No reason was attributed.',
  'conversation.outcomeSignal': 'Outcome evidence',
  'conversation.reasonEvidence': 'Reason evidence',
  'conversation.subScores': 'Rubric scores',
  'conversation.violations': 'Rule violations',
  'conversation.products': 'Products of interest',
  'conversation.secondaryReasons': 'Secondary reasons',
  'conversation.coaching': 'Coaching suggestion',
  'conversation.readOnlyNotice':
    'This platform never messages the customer — it only observes.',

  'analysis.title': 'AI analysis',
  'analysis.modelHint': '{model} · {date}',
  'analysis.legacy.title': 'Archived conversations are not scored',
  'analysis.legacy.description':
    'History loaded through backfill is never scored automatically, so there is no analysis.',
  'analysis.missing.title': 'Analysis is not ready yet',
  'analysis.missing.description':
    'Scoring runs in the background after a conversation closes. Check back shortly.',
  'analysisStage.realtime': 'Quick analysis',
  'analysisStage.batch': 'Full nightly analysis',

  'transcript.title': 'Transcript',
  'transcript.count': '{count} messages',
  'transcript.empty': 'No messages',
  'transcript.loadEarlier': 'Load earlier messages',
  'transcript.pending': 'Transcription pending…',
  'transcript.playAudio': 'Play audio',
  'transcript.audioFailed': 'Could not load the recording.',

  'overrideHistory.title': 'Correction history',
  'overrideHistory.description':
    'Every change a manager made — nothing is ever deleted.',
  'overrideHistory.empty': 'was empty',

  'agreements.title': 'Agreements',
  'agreements.description': 'Promises made during this conversation.',

  'assign.action': 'Assign',
  'assign.title': 'Assign the conversation',
  'assign.description':
    'A manual assignment is final: no automatic mode will ever overwrite it.',
  'assign.employee': 'Employee',
  'assign.employeeHint': 'Only active employees are listed.',
  'assign.selectEmployee': 'Select an employee',
  'assign.submit': 'Assign',
  'assign.otherCompany': 'That employee belongs to another company.',
  'assign.notFound': 'No such employee.',

  'override.action': 'Correct',
  'override.title': 'Correct the AI conclusion',
  'override.description':
    'A correction is stored as a new record — the AI result is never deleted.',
  'override.field': 'What to correct',
  'override.newOutcome': 'New outcome',
  'override.newScore': 'New score',
  'override.scoreHint': 'A whole number from 0 to 100.',
  'override.scoreInvalid':
    'The score must be a whole number between 0 and 100.',
  'override.newReason': 'New reason',
  'override.reasonHint': 'The list comes from your company taxonomy.',
  'override.selectReason': 'Select a reason',
  'override.submit': 'Save',
  'override.outcomeInvalid': 'That outcome value does not exist.',
  'override.reasonInvalid': 'That reason code does not exist.',
  'error.roleRequired': 'This action requires a manager role.',

  /* ---------------------------------------------------------------- Enums */
  'outcome.sotildi': 'Sold',
  'outcome.sotilmadi': 'Not sold',
  'outcome.noaniq': 'Unclear',

  'sentiment.positive': 'Positive',
  'sentiment.neutral': 'Neutral',
  'sentiment.negative': 'Negative',
  'sentiment.angry': 'Angry',

  'channel.telegram': 'Telegram',
  'channel.instagram': 'Instagram',
  'channel.web': 'Web chat',

  'messageType.text': 'Text',
  'messageType.voice': 'Voice note',
  'messageType.image': 'Image',
  'messageType.video': 'Video',
  'messageType.file': 'File',
  'messageType.sticker': 'Sticker',
  'messageType.location': 'Location',
  'messageType.other': 'Other',

  'agreementStatus.pending': 'Pending',
  'agreementStatus.fulfilled': 'Fulfilled',
  'agreementStatus.forgotten': 'Forgotten',

  'attributionSource.mode_1': 'By account',
  'attributionSource.mode_2_shift': 'By shift',
  'attributionSource.mode_3_extension': 'By extension',
  'attributionSource.widget': 'By widget',
  'attributionSource.legacy': 'Archive',
  'attributionSource.manual': 'Manual',
  'attributionSource.unassigned': 'Unassigned',

  /* ------------------------------------------------------------- Team */
  'team.subtitle':
    '{company} — employee league table and department comparison',
  'team.leaderboard': 'Employee league table',
  'team.leaderboardHint':
    'Who is improving and who is slipping. Click a row for the full card.',
  'team.rankBy': 'Rank by',
  'team.overallScore': 'Overall score',
  'team.employee': 'Employee',
  'team.score': 'Score',
  'team.change': 'Change',
  'team.conversations': 'Conversations',
  'team.violations': 'Violations',
  'team.violationsHint': 'Conversations carrying at least one rule violation.',
  'team.response': 'Response time',
  'team.noDepartment': 'No department',
  'team.unrankedHint':
    'Ranking needs at least 5 scored conversations — this employee has no position yet.',
  'team.empty.title': 'Nothing to rank yet',
  'team.empty.description':
    'No closed conversation in this period is assigned to an employee.',
  'team.departments': 'Departments',
  'team.departmentsHint': 'Department score — sorted by average',
  'team.departmentMeta':
    '{employees} employees · {conversations} conversations',
  'team.noDepartments.title': 'No departments set',
  'team.noDepartments.description':
    'Fill in the department field on employee records and this comparison starts working.',

  /* --------------------------------------------------------- Employee card */
  'employee.title': 'Employee card',
  'employee.backToTeam': 'Back to team',
  'employee.rank': 'Rank',
  'employee.rankOf': 'of {total}',
  'employee.rankHint':
    'Position among ranked employees only (5+ scored conversations).',
  'employee.scoredOf': '{scored} of {handled} scored',
  'employee.scoredHint':
    'The average covers scored conversations only; the gap is what still awaits analysis.',
  'employee.workload': 'Workload',
  'employee.workloadHint': 'Closed conversations assigned to this employee.',
  'employee.perDay': '{value} per day on average',
  'employee.avgResponse': 'Average reply: {value}',
  'employee.agreementsCaption': '{taken} agreements · {forgotten} forgotten',
  'employee.trend': 'Daily quality trend',
  'employee.trendHint': 'Average score per day',
  'employee.noTrend.title': 'No scored conversations in this period',
  'employee.noTrend.description': 'Try widening the range.',
  'employee.rubricHint': 'This employee’s strongest and weakest skills',
  'employee.funnelHint': 'This employee’s conversations across the script',
  'employee.examples': 'Examples',
  'employee.examplesHint':
    'The best and weakest conversations — coaching starts here.',
  'employee.best': 'Best',
  'employee.worst': 'Weakest',
  'employee.noExamples': 'No examples',
  'employee.coaching': 'Coaching suggestions',
  'employee.coachingHint':
    'Short notes written by the nightly analysis, newest first.',
  'employee.notFound.title': 'Employee not found',
  'employee.notFound.description':
    'No such employee, or they belong to another company.',

  'cabinet.subtitle': '{name} — your own metrics',
  'cabinet.noProfile.title': 'You have no employee cabinet',
  'cabinet.noProfile.description':
    'Your account is not linked to an employee record, so personal metrics are not calculated. An administrator needs to connect you to the employee roster.',

  /* --------------------------------------------------- Products and reasons */
  'products.subtitle':
    'Which product is lost, and why. Archived conversations are included too.',
  'products.title': 'Top lost opportunities',
  'products.description':
    'Customers lost per product. Expand a row to see the reasons.',
  'products.customersLost': '{count} customers',
  'products.lostValueHint':
    'Price × customers lost. An estimate of the revenue left on the table.',
  'products.noPriceHint':
    'This product has no price in the catalog, so no money value can be calculated.',
  'products.seeConversations': 'See conversations',
  'products.empty.title': 'No lost products',
  'products.empty.description':
    'No lost conversation in this period names a product. With an empty catalog the AI cannot identify products at all.',

  'reasons.title': 'Reason breakdown',
  'reasons.description': 'Why customers did not buy',
  'reasons.denominator': '{count} conversations',
  'reasons.denominatorHint':
    'This counts lost conversations that carry an attributed reason. It is not "all lost conversations" and is normally smaller.',
  'reasons.customersHint': 'Distinct customers',
  'reasons.emerging': 'Emerging themes',
  'reasons.emergingHint':
    'Free text behind the "other" reason, clustered into themes. A discovery list, not a precise statistic.',
  'reasons.empty.title': 'No reasons attributed',
  'reasons.empty.description':
    'No lost conversation in this period carries a reason.',

  /* -------------------------------------------------------------- Agreements */
  'agreementsBoard.subtitle':
    'Promises your team made: which were kept and which were forgotten.',
  'agreementsBoard.taken': 'Promises made',
  'agreementsBoard.takenHint':
    'How many commitments the AI found in conversations.',
  'agreementsBoard.pendingCaption': '{count} pending',
  'agreementsBoard.fulfillmentRate': 'Fulfilment rate',
  'agreementsBoard.rateHint':
    'kept / (kept + forgotten). Pending promises are excluded from the denominator.',
  'agreementsBoard.fulfilledCaption': '{count} kept',
  'agreementsBoard.forgottenCaption': 'Past due and never delivered',
  'agreementsBoard.forgottenHint':
    'Promises the nightly sweep marked as forgotten.',
  'agreementsBoard.overdue': 'Overdue',
  'agreementsBoard.overdueCaption': 'Among the pending ones',
  'agreementsBoard.overdueHint':
    'A subset of pending: the due date has passed but they are not marked forgotten yet.',
  'agreementsBoard.trend': 'Daily movement',
  'agreementsBoard.trendHint': 'Promises kept and forgotten',
  'agreementsBoard.upcoming': 'Due soon',
  'agreementsBoard.upcomingHint':
    'Earliest due date first. Click a row to open the conversation.',
  'agreementsBoard.noUpcoming.title': 'Nothing pending',
  'agreementsBoard.noUpcoming.description':
    'There are no open promises with a due date.',
  'agreementsBoard.byEmployee': 'By employee',
  'agreementsBoard.byEmployeeHint':
    'Promises with no employee are omitted here, so this column may total less than the overall count.',
  'agreementsBoard.rowHint': 'kept / forgotten',
  'agreementsBoard.ofTaken': 'of {count}',
  'agreementsBoard.noByEmployee': 'No promises linked to an employee',
  'agreementsBoard.empty.title': 'No promises in this period',
  'agreementsBoard.empty.description':
    'Promises are extracted from the conversation text by the nightly full analysis.',

  /* -------------------------------------------------------------- Signals */
  'signals.title': 'Needs attention',
  'signals.description':
    'Conversations that deserve a manager. The list is recomputed on every read.',
  'signals.openTotal': '{count} open in total',
  'signals.resolvedCount': '{count} handled',
  'signals.resolve': 'Mark as handled',
  'signals.resolveHint':
    'The conversation leaves this signal queue. The data itself is unchanged and this cannot be undone.',
  'signals.allHandled': 'All handled',
  'signals.empty.title': 'Nothing needs attention',
  'signals.empty.description':
    'No signal fired in this period — everything is in order.',

  'signal.unanswered': 'Never answered',
  'signal.unassigned': 'Unassigned',
  'signal.low_score': 'Low score',
  'signal.rule_violations': 'Rule violations',
  'signal.angry_customer': 'Angry customer',
  'signal.forgotten_agreement': 'Forgotten promise',
  'signal.needs_review': 'Needs review',

  'signalHint.unanswered':
    'The customer wrote, but there is not a single outbound message.',
  'signalHint.unassigned':
    'No employee was resolved after every attribution rule ran.',
  'signalHint.low_score':
    'The conversation scored 49 or below — the “poor” band.',
  'signalHint.rule_violations':
    'The analysis found at least one rule violation.',
  'signalHint.angry_customer':
    'The customer’s closing sentiment was scored as angry.',
  'signalHint.forgotten_agreement':
    'The nightly sweep marked a promise as forgotten.',
  'signalHint.needs_review': 'The quick and full analysis scores diverged.',

  /* ------------------------------------------------------------- Insights */
  'insights.action': 'Get AI insights',
  'insights.title': 'AI insights',
  'insights.failed':
    'Could not fetch the narration. The chart itself is unaffected.',
  'insights.busy':
    'The AI is busy — try again in a moment. Your request was valid.',
  'insights.caveat':
    'These are hypotheses, not conclusions. The numbers are computed server-side; the model only narrates them.',

  /* ------------------------------------------------------------- Ask AI */
  'ask.title': 'Ask the AI',
  'ask.description':
    'Ask a question about this period’s statistics — the answer rests only on them.',
  'ask.placeholder': 'For example: who forgets the most promises?',
  'ask.submit': 'Ask',
  'ask.thinking': 'Working on it — this can take a few seconds…',
  'ask.failed':
    'No answer came back. Try a shorter question or a narrower period.',
  'ask.busy':
    'The AI is busy. Your question was fine — press Ask again in a moment.',
  'ask.evidence': 'Conversations behind the answer',
  'ask.clear': 'Clear the thread',
  'ask.suggestion.1': 'Which employee is performing best?',
  'ask.suggestion.2': 'What reason loses us the most sales?',
  'ask.suggestion.3': 'What should we fix first in this period?',
  'ask.scopeHint':
    'The model sees only this period’s statistics — never message text or customer contact details. Every question is independent; the previous one is not remembered.',

  /* -------------------------------------------------------------- Settings */
  'settings.subtitle':
    'Company, employees and AI configuration. Reading is open to everyone; changing anything requires a manager role.',
  'settings.readOnly': 'Read-only',
  'settings.company': 'Company',
  'settings.employees': 'Employees',
  'settings.catalog': 'AI configuration',
  'settings.products': 'Products',
  'settings.reasons': 'Reasons',
  'settings.rulebook': 'Rulebook',
  'settings.save': 'Save',
  'settings.saved': 'Saved',
  'settings.saveFailed': 'Could not save',
  'settings.companyTitle': 'Company settings',
  'settings.companyHint':
    'These settings decide who a conversation is attributed to and when it closes.',
  'settings.companyName': 'Company name',
  'settings.timezone': 'Timezone',
  'settings.timezoneHint':
    'An IANA name such as Asia/Tashkent. Shift schedules are evaluated in this zone.',
  'settings.timezoneInvalid':
    'No such timezone. Use the full IANA name (Asia/Tashkent).',
  'settings.attributionMode': 'Attribution mode',
  'settings.attributionModeHint':
    'Changing the mode does not re-attribute existing conversations, and a manual assignment is never overwritten.',
  'settings.idleGap': 'Conversation close gap',
  'settings.idleGapHint':
    'After this much silence a conversation closes and a new one begins.',
  'settings.hours': '{count} h',
  'settings.retention': 'Data retention (months)',
  'settings.retentionHint':
    'Leave empty to keep forever. Otherwise the weekly sweep purges conversations older than this.',
  'settings.retentionForever': 'Forever',
  'settings.retentionWarning':
    'Careful: conversations, messages and their analysis older than {months} months will be permanently deleted by the next weekly sweep. This cannot be undone.',

  /* ------------------------------------------------------------- Employees */
  'employeesTable.description':
    'The people whose conversations get scored. Deactivate someone who has left rather than deleting them.',
  'employeesTable.search': 'Search by name',
  'employeesTable.add': 'Add employee',
  'employeesTable.shiftCount': '{count} shifts',
  'employeesTable.cabinet': 'Cabinet',
  'employeesTable.linked': 'Linked',
  'employeesTable.empty.title': 'No employees yet',
  'employeesTable.empty.description':
    'Without employees neither the league table nor assignment can work. Add the first one.',

  'employeeForm.createTitle': 'New employee',
  'employeeForm.editTitle': 'Edit employee',
  'employeeForm.description':
    'Name and department drive the league table and the department comparison.',
  'employeeForm.fullName': 'Full name',
  'employeeForm.department': 'Department',
  'employeeForm.departmentHint':
    'The only source for the department comparison. Pick an existing name so one department is not written two ways.',
  'employeeForm.active': 'Active',
  'employeeForm.activeHint':
    'An inactive employee disappears from assignment pickers but keeps their history.',
  'employeeForm.shifts': 'Shift schedule',
  'employeeForm.shiftsHint':
    'Used only under the shift-schedule attribution mode. Times are local to the company timezone.',
  'employeeForm.noShifts': 'No shifts set',
  'employeeForm.addShift': 'Add shift',
  'employeeForm.removeShift': 'Remove shift',
  'employeeForm.weekday': 'Weekday',
  'employeeForm.start': 'Start',
  'employeeForm.end': 'End',
  'employeeForm.overnightHint':
    'Overnight shifts are valid: 22:00 — 06:00 carries into the next day.',
  'employeeForm.userLinkNote':
    'Linking an employee to a system user is not done here — an administrator does it in the Django admin.',

  'weekday.mon': 'Monday',
  'weekday.tue': 'Tuesday',
  'weekday.wed': 'Wednesday',
  'weekday.thu': 'Thursday',
  'weekday.fri': 'Friday',
  'weekday.sat': 'Saturday',
  'weekday.sun': 'Sunday',

  /* -------------------------------------------------------------- Products */
  'productsTable.description':
    'The AI can only recognise products from this list. An empty list means empty product analytics.',
  'productsTable.search': 'Search by name',
  'productsTable.add': 'Add product',
  'productsTable.active': 'Active',
  'productsTable.delete': 'Delete',
  'productsTable.deactivate': 'Deactivate',
  'productsTable.deleteTitle': 'Delete product',
  'productsTable.deleteWarning':
    'Deleting also removes this product’s links to past analyses, so numbers in older reports shrink. Deactivation is usually the right call: it stops future matching but keeps the history.',
  'productsTable.empty.title': 'The catalog is empty',
  'productsTable.empty.description':
    'Until you add a product, the AI cannot identify one in conversations.',

  'productForm.createTitle': 'New product',
  'productForm.editTitle': 'Edit product',
  'productForm.description':
    'The name is shown to the AI exactly as written — spelling matters.',
  'productForm.name': 'Name',
  'productForm.category': 'Category',
  'productForm.descriptionField': 'Description',
  'productForm.price': 'Price',
  'productForm.priceHint':
    'With a price, lost opportunities are also valued in money.',
  'productForm.noPrice': 'Not set',
  'productForm.noPriceHint': 'No price set',
  'productForm.currency': 'Currency',
  'productForm.priceInvalid': 'The price must be a number.',
  'productForm.priceNegative': 'The price cannot be negative.',
  'productForm.duplicate':
    'A product with this name already exists. Two rows would split its statistics in half.',

  /* --------------------------------------------------------------- Reasons */
  'reasonsTable.description':
    'The "why didn’t they buy" taxonomy. The AI picks only from this list.',
  'reasonsTable.add': 'Add reason',
  'reasonsTable.defaults': 'Standard reasons',
  'reasonsTable.defaultsHint': 'Shipped with the platform and not editable.',
  'reasonsTable.own': 'Company reasons',
  'reasonsTable.ownHint': 'Extra reasons you have added.',
  'reasonsTable.noOwn': 'None added yet',
  'reasonsTable.locked': 'Locked',
  'reasonsTable.delete': 'Delete',

  'reasonForm.createTitle': 'New reason',
  'reasonForm.editTitle': 'Edit reason',
  'reasonForm.description':
    'The code is the machine key; the label is what users see.',
  'reasonForm.label': 'Label',
  'reasonForm.code': 'Code',
  'reasonForm.codeHint':
    'Generated from the label. Latin letters, digits and underscores only.',
  'reasonForm.codeLocked':
    'The code cannot change: analysis results and manager corrections store exactly this value.',
  'reasonForm.duplicate':
    'That code already exists — the check includes the standard reasons too.',

  /* -------------------------------------------------------------- Rulebook */
  'rulebook.description':
    'Your company’s internal sales rules. The file is parsed and turned into a dedicated prompt for the nightly scoring.',
  'rulebook.upload': 'Upload rulebook',
  'rulebook.formats':
    'PDF, DOCX or XLSX. Up to 20 MB. Uploading a new file is how you update the rules.',
  'rulebook.typeUnsupported':
    'This file type is not supported. Choose PDF, DOCX or XLSX.',
  'rulebook.tooLarge': 'The file is larger than 20 MB.',
  'rulebook.legacyFormat':
    'The legacy .doc / .xls format fails during parsing. Re-save the file as .docx or .xlsx.',
  'rulebook.uploadFailed': 'Could not upload the file.',
  'rulebook.processing':
    'The file is being parsed. For a long document this can take a few minutes.',
  'rulebook.ready':
    'Rules activated. The effect starts with the next nightly analysis.',
  'rulebook.processingFailed': 'Could not parse the file.',
  'rulebook.active': 'Active',
  'rulebook.download': 'Download',
  'rulebook.delete': 'Delete',
  'rulebook.empty.title': 'No rulebook uploaded',
  'rulebook.empty.description':
    'Without a file, conversations are scored against the platform’s baseline rules.',

  'rulebookStatus.uploaded': 'Queued',
  'rulebookStatus.processing': 'Parsing',
  'rulebookStatus.ready': 'Ready',
  'rulebookStatus.error': 'Error',

  /* ---------------------------------------------------------- Integrations */
  'settings.integrations': 'Integrations',
  'integrations.modeNotice':
    'Current attribution mode: {mode}. You can change it under "Company".',

  'accountStatus.pending': 'Connecting',
  'accountStatus.connected': 'Connected',
  'accountStatus.disconnected': 'Disconnected',
  'accountStatus.error': 'Error',

  /* -------------------------------------------------------------- Telegram */
  'telegram.title': 'Telegram',
  'telegram.description':
    'A Telegram account lets us observe direct messages. Group chats are deliberately not monitored.',
  'telegram.connect': 'Connect account',
  'telegram.connectTitle': 'Connect a Telegram account',
  'telegram.connectDescription':
    'The QR code is the easiest route. SMS is the fallback.',
  'telegram.accountType': 'Account type',
  'telegram.accountTypeHint':
    'A company number or an employee’s personal number.',
  'telegram.typeCompany': 'Company',
  'telegram.typePersonal': 'Personal',
  'telegram.consent': 'Employee consent obtained',
  'telegram.consentHint':
    'Connecting a personal number requires the employee’s written consent. Without it the server refuses the connection.',
  'telegram.defaultEmployee': 'Default employee',
  'telegram.defaultEmployeeHint':
    'Under account-based attribution, every conversation on this account is credited to this employee.',
  'telegram.noDefaultEmployee': 'Not selected',
  'telegram.startQr': 'Connect with a QR code',
  'telegram.useSms': 'Connect via SMS',
  'telegram.qrAlt': 'QR code for Telegram',
  'telegram.qrInstructions':
    'Telegram → Settings → Devices → "Link Desktop Device", then scan this code. It refreshes every 30 seconds.',
  'telegram.phone': 'Phone number',
  'telegram.phoneHint': 'In international format, e.g. +998901234567.',
  'telegram.sendCode': 'Send code',
  'telegram.code': 'Code from Telegram',
  'telegram.codeHint': 'The code arrives as a message in the Telegram app.',
  'telegram.verify': 'Verify',
  'telegram.password': 'Two-factor password',
  'telegram.passwordHint':
    'This account has two-factor protection — enter its Telegram cloud password.',
  'telegram.submitPassword': 'Continue',
  'telegram.connected': 'Account connected',
  'telegram.tier0Note':
    'The last six months of history are being fetched automatically — it is stored, not scored.',
  'telegram.disconnect': 'Disconnect',
  'telegram.lastHealthy': 'Last seen: {value}',
  'telegram.staleHeartbeat':
    'This account has not checked in for over 15 minutes. The session may be breaking — be ready to reconnect.',
  'telegram.empty.title': 'Telegram is not connected',
  'telegram.empty.description':
    'Until an account is connected, Telegram conversations are not analysed.',

  'telegram.error.consent':
    'A personal account requires the employee-consent checkbox.',
  'telegram.error.phoneInvalid':
    'Invalid phone number. Use the international format.',
  'telegram.error.phoneTaken':
    'That number is already connected to another company.',
  'telegram.error.phoneBanned': 'Telegram has banned this number.',
  'telegram.error.codeInvalid': 'The code is wrong or has expired.',
  'telegram.error.codeSendFailed':
    'Could not send the code. Try again shortly.',
  'telegram.error.codeVerifyFailed':
    'Could not verify the code. Please try again.',
  'telegram.error.passwordRejected': 'The password was rejected.',
  'telegram.error.passwordNotRequired':
    'This login never asked for a password. Start the flow again.',
  'telegram.error.loginExpired':
    'The login session expired. Please start again.',
  'telegram.error.floodWait':
    'Telegram is rate-limiting us. Wait a moment and try again.',
  'telegram.error.accountTaken':
    'That Telegram account is connected to another company.',
  'telegram.error.qrFailed': 'Could not reach Telegram. Please try again.',
  'telegram.error.throttled':
    'No more than 10 connection attempts per hour. Please wait a little.',

  /* -------------------------------------------------------------- Backfill */
  'backfill.title': 'History import',
  'backfill.description':
    'Fetch older conversations and score them too. Only one job runs at a time.',
  'backfill.cancel': 'Cancel',
  'backfill.fetched': '{count} messages',
  'backfillScope.tier_0': 'Automatic (6 months)',
  'backfillScope.tier_a': 'Unscored',
  'backfillScope.tier_b': 'Last 30 days',
  'backfillScope.tier_c': 'Last 6 months',
  'backfillStatus.pending': 'Queued',
  'backfillStatus.running': 'Running',
  'backfillStatus.cancelled': 'Cancelled',
  'backfillStatus.completed': 'Completed',
  'backfillStatus.error': 'Error',

  /* ------------------------------------------------------------- Instagram */
  'instagram.title': 'Instagram',
  'instagram.description':
    'Direct messages of an Instagram professional account are observed.',
  'instagram.connect': 'Connect Instagram',
  'instagram.reconnect': 'Reconnect',
  'instagram.pause': 'Pause monitoring',
  'instagram.resume': 'Resume monitoring',
  'instagram.remove': 'Remove connection',
  'instagram.tokenUntil': 'Token valid until: {date}',
  'instagram.connectSuccess': 'Instagram connected successfully.',
  'instagram.connectFailed': 'Could not connect Instagram. Please try again.',
  'instagram.empty.title': 'Instagram is not connected',
  'instagram.empty.description':
    'Connecting requires granting access through Meta — a few steps.',
  'instagramState.monitoring': 'Monitoring',
  'instagramState.paused': 'Paused',
  'instagramState.token_expiring': 'Token expiring',
  'instagramState.reconnect_required': 'Reconnect required',

  /* --------------------------------------------------------------- Widget */
  'web.title': 'Web chat',
  'web.description':
    'Your own backend reports site-chat messages using a widget key. Kotib does not host the chat itself.',
  'web.create': 'Create key',
  'web.createTitle': 'New widget key',
  'web.createDescription':
    'Create a separate key per site, so rotating one never affects the others.',
  'web.name': 'Name',
  'web.nameHint': 'For example: main site, landing page.',
  'web.unnamed': 'Unnamed',
  'web.rotate': 'Rotate key',
  'web.rotateWarning':
    'Listings show only the last four characters of a key. If one is lost it can only be rotated — the old key stops working instantly, so update the site first.',
  'web.keyTitle': 'Widget key',
  'web.keyDescription':
    'This key will never be shown again. Copy it now and store it somewhere safe.',
  'web.keySaved': 'I saved it',
  'web.copyKey': 'Copy',
  'web.keyWarning':
    'Keep the key on your server only. Never put it in page JavaScript: anyone holding it can post fabricated messages.',
  'web.empty.title': 'No widget keys',
  'web.empty.description': 'To connect your site chat, create a key first.',

  /* ------------------------------------------------------------- Customers */
  'customers.subtitle':
    'One customer record per channel. Records of the same person across channels can be merged by hand.',
  'customers.description':
    'Per-channel customer identities. There is no automatic matching.',
  'customers.search': 'Name, username or phone',
  'customers.name': 'Customer',
  'customers.phone': 'Phone',
  'customers.state': 'State',
  'customers.firstSeen': 'First seen',
  'customers.alias': 'Merged',
  'customers.aliasHint':
    'This record has been merged into another customer and no longer counts separately.',
  'customers.mergedCount': '+{count} records',
  'customers.mergedIntoThisHint':
    'How many records from other channels were merged into this customer.',
  'customers.empty.title': 'No customers found',
  'customers.empty.description':
    'Once a channel is connected and conversations arrive, customers appear automatically.',

  'merge.title': 'Merge customers',
  'merge.description':
    'The left record is folded into the right one: its conversations remain, but it stops counting separately.',
  'merge.pickTarget': 'Pick the surviving record',
  'merge.search': 'Search for the surviving record',
  'merge.searchHint':
    'Only standalone records are listed — you cannot merge into one that is already merged.',
  'merge.submit': 'Merge',
  'merge.error.self': 'A record cannot be merged into itself.',
  'merge.error.cycle':
    'These two records are already linked the other way round.',
  'merge.error.notCanonical':
    'That record is itself merged into another. Pick the surviving one.',
  'merge.error.otherCompany': 'That customer belongs to another company.',
  'merge.error.notFound': 'No such customer.',

  /* --------------------------------------------------------------- Reports */
  'reports.subtitle':
    'Excel reports. A file is kept for 24 hours and then deleted automatically.',
  'reports.title': 'Exports',
  'reports.description': 'The 50 most recent jobs. Only .xlsx is available.',
  'reports.kind': 'Report type',
  'reports.kindConversations': 'Conversations',
  'reports.kindRatings': 'Ratings',
  'reports.kind.conversations': 'Conversations report',
  'reports.kind.ratings': 'Employee ratings',
  'reports.create': 'Create report',
  'reports.download': 'Download',
  'reports.window': '{from} — {to}',
  'reports.expiresIn': 'expires {value}',
  'reports.expired': 'expired',
  'reports.empty.title': 'No reports yet',
  'reports.empty.description':
    'Pick a period and create a report — the file is built in the background.',
  'exportStatus.pending': 'Queued',
  'exportStatus.running': 'Building',
  'exportStatus.done': 'Ready',
  'exportStatus.error': 'Error',

  /* ---------------------------------------------- Logins & passwords */

  'settings.account': 'Login & password',
  'account.identity': 'My account',
  'account.identityDescription': 'The login you are signed in with.',
  'account.logins': 'Logins',
  'account.loginsDescription': 'Create a login for the company.',
  'account.loginsHint':
    'There is no API that lists logins, so this only creates new ones. An existing login’s password is reset from the Employees section.',

  'user.username': 'Username',
  'user.usernameHint': 'Must be unique across the whole platform.',
  'user.name': 'Full name',
  'user.firstName': 'First name',
  'user.lastName': 'Last name',
  'user.role': 'Role',
  'user.roleHint': 'Only the roles you are allowed to grant are listed.',
  'user.passwordHint': 'Leave empty and one will be generated for you.',
  'user.passwordPlaceholder': 'Will be generated',
  'user.cabinet': 'Cabinet',
  'user.cabinetLinked': 'Linked to an employee profile',
  'user.cabinetMissing': 'Not linked',

  'credentials.title': 'Login created',
  'credentials.description':
    'The password is shown here, once, and never again.',
  'credentials.username': 'Username',
  'credentials.password': 'Password',
  'credentials.copyUsername': 'Copy username',
  'credentials.copyPassword': 'Copy password',
  'credentials.warning':
    'Once you close this dialog the password cannot be read back. Copy it now and hand it over.',
  'credentials.saved': 'I’ve copied it',

  'inviteUser.title': 'New login',
  'inviteUser.description':
    'Creates a login inside your company. The password is shown once.',
  'inviteUser.submit': 'Create login',
  'inviteUser.employee': 'Employee',
  'inviteUser.employeeHint':
    'Linking an employee is what opens their personal cabinet and the browser extension.',
  'inviteUser.noEmployee': 'No link',

  'resetPassword.title': 'Reset password',
  'resetPassword.description': 'A new password will be set for {name}.',
  'resetPassword.submit': 'Reset password',
  'resetPassword.newPassword': 'New password',
  'resetPassword.newPasswordHint':
    'Leave empty and one will be generated for you.',
  'resetPassword.sessionsNote':
    'A reset does not end open sessions — the old token stays valid for up to 5 more days.',

  'changePassword.title': 'Change password',
  'changePassword.description': 'You are changing your own password.',
  'changePassword.current': 'Current password',
  'changePassword.new': 'New password',
  'changePassword.confirm': 'Repeat the new password',
  'changePassword.mismatch': 'The passwords do not match.',
  'changePassword.unchanged':
    'The new password is the same as the current one.',
  'changePassword.submit': 'Change',
  'changePassword.success': 'Password changed.',

  'employeeForm.createLogin': 'Create a login too',
  'employeeForm.createLoginHint':
    'The employee and their login are created in one operation. A login cannot be added from this dialog later.',

  'conversationTable.extensionSilent': 'Extension was off',
  'conversationTable.extensionSilentHint':
    'Someone replied in this conversation, but the extension reported no sends at all — it was probably not running.',
}
