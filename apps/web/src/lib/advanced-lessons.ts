export type LessonTrack = 'software' | 'meetings' | 'writing' | 'negotiation' | 'presenting' | 'collaboration';

export interface AdvancedLesson {
  id: string;
  track: LessonTrack;
  eyebrow: string;
  title: string;
  summary: string;
  level: 'C1' | 'C1+' | 'C2';
  duration: number;
  skills: string[];
  scenario: string;
  objectives: string[];
  principle: {
    title: string;
    body: string;
    before: string;
    after: string;
  };
  phrases: Array<{
    phrase: string;
    meaning: string;
    usage: string;
  }>;
  dialogue: Array<{
    speaker: string;
    text: string;
    note?: string;
  }>;
  exercises: Array<{
    prompt: string;
    options: string[];
    answer: number;
    explanation: string;
  }>;
}

export const TRACK_LABELS: Record<LessonTrack, string> = {
  software: 'Software & IT systems',
  meetings: 'Họp & phản biện',
  writing: 'Viết chuyên nghiệp',
  negotiation: 'Đàm phán',
  presenting: 'Thuyết trình',
  collaboration: 'Hợp tác đa văn hóa',
};

export const ADVANCED_LESSONS: AdvancedLesson[] = [
  {
    id: 'architecture-trade-offs',
    track: 'software',
    eyebrow: 'SOFTWARE SYSTEMS · 01',
    title: 'Thảo luận trade-off kiến trúc hệ thống',
    summary: 'Trình bày lựa chọn kiến trúc bằng availability, scalability, coupling và migration risk.',
    level: 'C1+',
    duration: 24,
    skills: ['Speaking', 'Listening'],
    scenario: 'Trong buổi architecture review của một hệ thống enterprise, bạn cần giải thích vì sao tách một service giúp scale độc lập nhưng làm tăng độ phức tạp vận hành.',
    objectives: [
      'Mô tả trade-off thay vì tuyên bố một kiến trúc “tốt nhất”.',
      'Dùng đúng từ về dependency, coupling, failure và compatibility.',
      'Đưa ra recommendation gắn với constraint thực tế của hệ thống.',
    ],
    principle: {
      title: 'Quality attributes before technology choices',
      body: 'Một cuộc trao đổi kiến trúc tốt bắt đầu từ thuộc tính hệ thống cần tối ưu—reliability, latency, scalability hay maintainability—rồi mới đánh giá công nghệ. Điều này giúp recommendation có căn cứ thay vì chạy theo xu hướng.',
      before: 'Microservices are more modern, so we should split this module.',
      after: 'Splitting the module would let us scale ingestion independently, but it introduces another network boundary and operational dependency. Given our current load, I recommend keeping it modular within the existing service.',
    },
    phrases: [
      { phrase: 'a single point of failure', meaning: 'một điểm lỗi duy nhất có thể làm hỏng toàn hệ thống', usage: 'Dùng khi một component hoặc dependency không có redundancy.' },
      { phrase: 'tightly / loosely coupled', meaning: 'liên kết chặt / liên kết lỏng giữa các component', usage: 'Mô tả mức một module phụ thuộc vào implementation hoặc lifecycle của module khác.' },
      { phrase: 'scale horizontally', meaning: 'mở rộng bằng cách tăng số instance', usage: 'Phân biệt với vertical scaling—tăng tài nguyên cho một máy hoặc instance.' },
      { phrase: 'backward-compatible change', meaning: 'thay đổi vẫn tương thích với client phiên bản cũ', usage: 'Dùng cho API, schema, event hoặc protocol được triển khai lệch phiên bản.' },
    ],
    dialogue: [
      { speaker: 'Architect', text: 'Why not extract telemetry processing into a separate service now?' },
      { speaker: 'You', text: 'It would let us scale horizontally and deploy that workload independently. The trade-off is an additional network boundary and another service to operate.', note: 'Nêu cả lợi ích và operational cost trong cùng câu trả lời.' },
      { speaker: 'Architect', text: 'What would make the extraction worthwhile?' },
      { speaker: 'You', text: 'If telemetry load begins constraining the core API, or if the teams need independent release cycles, the balance changes. Until then, a clear module boundary gives us lower coupling without the distributed-system overhead.', note: 'Đưa ra trigger cụ thể để xem lại quyết định.' },
    ],
    exercises: [
      {
        prompt: 'Cụm nào mô tả component mà khi hỏng có thể làm dừng toàn hệ thống?',
        options: ['a source of truth', 'a single point of failure', 'a backward-compatible client', 'a horizontal instance'],
        answer: 1,
        explanation: '“Single point of failure” là component không có phương án dự phòng và có thể kéo toàn hệ thống xuống khi nó lỗi.',
      },
      {
        prompt: 'Recommendation nào thể hiện tư duy trade-off tốt nhất?',
        options: ['Microservices are always more scalable.', 'The monolith is old and should be replaced.', 'Extraction improves independent scaling but adds operational overhead; current load does not justify it yet.', 'Both options have advantages and disadvantages.'],
        answer: 2,
        explanation: 'Câu C nêu quality attribute, chi phí và constraint hiện tại, sau đó mới đi đến recommendation.',
      },
      {
        prompt: '“Backward-compatible” nghĩa là gì trong API change?',
        options: ['Client cũ vẫn tiếp tục hoạt động', 'Server tự động rollback', 'Database không cần backup', 'API chỉ chạy trên phiên bản mới'],
        answer: 0,
        explanation: 'Một thay đổi backward-compatible không phá vỡ consumer đang dùng contract hoặc phiên bản cũ.',
      },
      {
        prompt: 'Câu nào dùng “coupling” tự nhiên nhất?',
        options: ['The coupling server is offline.', 'This shared database creates tight coupling between the two services.', 'We need to coupling the modules.', 'The system has many couplings performance.'],
        answer: 1,
        explanation: '“Tight coupling between services/modules” là collocation chuẩn để nói hai thành phần phụ thuộc quá sâu vào nhau.',
      },
    ],
  },
  {
    id: 'incident-communication',
    track: 'software',
    eyebrow: 'INCIDENT MANAGEMENT · 02',
    title: 'Cập nhật production incident rõ và chính xác',
    summary: 'Phân biệt symptom, impact, mitigation và root cause khi trao đổi trong sự cố.',
    level: 'C1+',
    duration: 22,
    skills: ['Speaking', 'Writing'],
    scenario: 'Sau một release, tỷ lệ request lỗi tăng ở một region. Bạn cần cập nhật incident channel khi root cause chưa được xác nhận.',
    objectives: [
      'Tách điều quan sát được khỏi giả thuyết kỹ thuật.',
      'Mô tả blast radius và customer impact có định lượng.',
      'Phân biệt mitigation tạm thời với remediation dài hạn.',
    ],
    principle: {
      title: 'Observed fact ≠ working hypothesis',
      body: 'Trong incident, ngôn ngữ quá chắc chắn có thể đẩy đội theo sai hướng. Hãy đánh dấu rõ observed, suspected và confirmed; đồng thời cập nhật biện pháp containment cùng thời điểm kiểm tra tiếp theo.',
      before: 'The database change caused the outage. We are fixing it.',
      after: 'We observed a 12% error rate after the deployment. A schema mismatch is the leading hypothesis, but it is not yet confirmed. We have rolled back and error rates are recovering.',
    },
    phrases: [
      { phrase: 'the blast radius', meaning: 'phạm vi người dùng hoặc hệ thống bị ảnh hưởng', usage: 'Dùng để định lượng region, service, tenant hoặc workflow nào nằm trong phạm vi sự cố.' },
      { phrase: 'a regression introduced by…', meaning: 'lỗi tái phát hoặc hành vi xấu xuất hiện do thay đổi…', usage: 'Dùng khi chức năng từng hoạt động nhưng bị hỏng sau code/config change.' },
      { phrase: 'mitigation vs remediation', meaning: 'giảm tác động tạm thời và xử lý nguyên nhân lâu dài', usage: 'Rollback có thể là mitigation; sửa thiết kế và bổ sung test thường là remediation.' },
      { phrase: 'reproduce the issue', meaning: 'tái hiện lỗi một cách có kiểm soát', usage: 'Bước quan trọng trước khi xác nhận root cause hoặc kiểm chứng fix.' },
    ],
    dialogue: [
      { speaker: 'Incident lead', text: 'Do we know whether all customers are affected?' },
      { speaker: 'You', text: 'The blast radius is currently limited to EU-West accounts using the bulk-import endpoint. Other regions and standard imports are healthy.', note: 'Giới hạn impact bằng region và workflow cụ thể.' },
      { speaker: 'Incident lead', text: 'Is the new parser the root cause?' },
      { speaker: 'You', text: 'It is our leading hypothesis because the errors began after deployment, but we have not reproduced the issue yet. Rollback is the immediate mitigation; we will confirm root cause separately.', note: 'Không biến correlation thành kết luận nguyên nhân.' },
    ],
    exercises: [
      {
        prompt: 'Câu nào cập nhật incident chính xác nhất khi root cause chưa chắc chắn?',
        options: ['The parser definitely caused it.', 'We think something is wrong.', 'The parser is the leading hypothesis, but it has not yet been confirmed.', 'The root cause will be fixed soon.'],
        answer: 2,
        explanation: 'Câu C nêu giả thuyết rõ nhưng giữ đúng mức độ chắc chắn của bằng chứng hiện có.',
      },
      {
        prompt: 'Rollback nhanh để giảm error rate được gọi là gì?',
        options: ['remediation', 'mitigation', 'root cause', 'regression testing'],
        answer: 1,
        explanation: 'Rollback giảm tác động hiện tại nên là mitigation. Remediation xử lý nguyên nhân để lỗi không tái diễn.',
      },
      {
        prompt: '“Blast radius” nên được mô tả bằng gì?',
        options: ['Mức độ căng thẳng của đội', 'Số dòng code thay đổi', 'Users, regions và workflows bị ảnh hưởng', 'Thời gian họp incident'],
        answer: 2,
        explanation: 'Blast radius là phạm vi tác động, nên cần định lượng bằng đối tượng và chức năng thực sự bị ảnh hưởng.',
      },
      {
        prompt: 'Câu nào mô tả regression đúng?',
        options: ['The new release broke a workflow that previously passed.', 'The team created a new requirement.', 'The server needs more capacity next year.', 'The user requested a feature.'],
        answer: 0,
        explanation: 'Regression là chức năng đã từng hoạt động nhưng bị hỏng sau một thay đổi mới.',
      },
    ],
  },
  {
    id: 'requirements-and-api-contracts',
    track: 'software',
    eyebrow: 'SYSTEM INTEGRATION · 03',
    title: 'Làm rõ requirement và API contract',
    summary: 'Hỏi đúng câu để phát hiện ambiguity, edge case và dependency trước khi implement.',
    level: 'C1',
    duration: 23,
    skills: ['Speaking', 'Reading', 'Writing'],
    scenario: 'Hai team ở các location khác nhau đang tích hợp qua REST API, nhưng ticket chỉ ghi “sync user status in real time” và chưa định nghĩa failure behaviour.',
    objectives: [
      'Tách functional requirement khỏi non-functional requirement.',
      'Chuyển từ ngữ mơ hồ thành acceptance criteria kiểm thử được.',
      'Làm rõ source of truth, ownership và contract khi tích hợp.',
    ],
    principle: {
      title: 'Turn adjectives into measurable behaviour',
      body: 'Các từ như fast, reliable, real time và user-friendly không đủ để implement hoặc test. Hãy hỏi chúng có nghĩa gì bằng latency, availability, data consistency và hành vi khi dependency thất bại.',
      before: 'The status should update in real time and the API must be reliable.',
      after: 'The status should be visible within five seconds for 99% of updates. If the consumer is unavailable, the producer retries three times and then places the event in a dead-letter queue.',
    },
    phrases: [
      { phrase: 'acceptance criteria', meaning: 'tiêu chí nghiệm thu có thể kiểm chứng', usage: 'Mô tả điều phải đúng để story hoặc requirement được coi là hoàn tất.' },
      { phrase: 'a non-functional requirement', meaning: 'yêu cầu về chất lượng hoặc ràng buộc hệ thống', usage: 'Ví dụ latency, availability, security, capacity và maintainability.' },
      { phrase: 'the source of truth', meaning: 'nguồn dữ liệu có thẩm quyền cuối cùng', usage: 'Làm rõ hệ thống nào quyết định giá trị khi dữ liệu giữa các service khác nhau.' },
      { phrase: 'an edge case', meaning: 'trường hợp biên hoặc hiếm nhưng hợp lệ', usage: 'Dùng cho input, state hoặc timing nằm ngoài happy path thông thường.' },
    ],
    dialogue: [
      { speaker: 'Product owner', text: 'User status needs to be synchronized in real time.' },
      { speaker: 'You', text: 'What does real time mean for this workflow—under one second, five seconds, or one minute?', note: 'Biến adjective mơ hồ thành ngưỡng đo được.' },
      { speaker: 'Product owner', text: 'Five seconds is acceptable.' },
      { speaker: 'You', text: 'Which system is the source of truth, and what should happen if the consumer is unavailable? I would like those behaviours in the acceptance criteria before we finalize the API contract.', note: 'Làm rõ ownership và failure path trước implementation.' },
    ],
    exercises: [
      {
        prompt: 'Ví dụ nào là non-functional requirement?',
        options: ['The user can export a report.', 'The API responds within 300 ms at the 95th percentile.', 'The admin can delete an account.', 'The system sends a confirmation email.'],
        answer: 1,
        explanation: 'Latency target mô tả thuộc tính chất lượng của hệ thống; các câu còn lại mô tả chức năng.',
      },
      {
        prompt: 'Câu hỏi nào làm rõ “real time” tốt nhất?',
        options: ['Can you explain more?', 'Is real time important?', 'What is the maximum acceptable delay at the 99th percentile?', 'Should we use WebSockets?'],
        answer: 2,
        explanation: 'Câu C biến khái niệm mơ hồ thành một ngưỡng có thể đo và test trước khi chọn công nghệ.',
      },
      {
        prompt: '“Source of truth” là hệ thống nào?',
        options: ['Hệ thống có giao diện đẹp nhất', 'Hệ thống giữ giá trị có thẩm quyền cuối cùng', 'Hệ thống gọi API đầu tiên', 'Hệ thống có nhiều log nhất'],
        answer: 1,
        explanation: 'Source of truth là nơi dữ liệu được xem là chính xác và có quyền quyết định khi có xung đột.',
      },
      {
        prompt: 'Acceptance criterion nào test được rõ nhất?',
        options: ['The API should be fast.', 'The sync should usually work.', '99% of status updates are visible within five seconds.', 'Users should have a good experience.'],
        answer: 2,
        explanation: 'Câu C có metric, tỷ lệ và ngưỡng thời gian nên có thể kiểm chứng tự động.',
      },
    ],
  },
  {
    id: 'code-review-and-release',
    track: 'software',
    eyebrow: 'ENGINEERING DELIVERY · 04',
    title: 'Code review, technical debt và release',
    summary: 'Trao đổi về chất lượng code và rủi ro release mà không biến review thành phê bình cá nhân.',
    level: 'C1+',
    duration: 21,
    skills: ['Speaking', 'Writing'],
    scenario: 'Một pull request đáp ứng happy path nhưng thiếu test cho retry và làm tăng coupling. Release window lại đang rất gần.',
    objectives: [
      'Viết review comment tập trung vào risk và maintainability.',
      'Phân biệt refactor với functional change.',
      'Thảo luận technical debt cùng kế hoạch trả nợ cụ thể.',
    ],
    principle: {
      title: 'Review the change, not the author',
      body: 'Một review có chất lượng mô tả hành vi, rủi ro và tiêu chí mong muốn. Khi phải chấp nhận giải pháp tạm thời, hãy ghi rõ debt, owner và thời điểm xử lý thay vì để “temporary” tồn tại vô hạn.',
      before: 'You wrote this in a complicated way and forgot the tests.',
      after: 'This implementation covers the happy path, but retry failure is currently untested and the direct database access increases coupling. Could we add the failure-path test before merge and track the repository abstraction separately?',
    },
    phrases: [
      { phrase: 'technical debt', meaning: 'chi phí tương lai do chọn giải pháp nhanh hoặc chưa hoàn thiện', usage: 'Nên đi cùng impact, owner và repayment plan; không dùng như nhãn chung cho mọi code cũ.' },
      { phrase: 'refactor without changing behaviour', meaning: 'cải tổ cấu trúc mà không đổi hành vi bên ngoài', usage: 'Phân biệt cải thiện maintainability với feature hoặc bug fix.' },
      { phrase: 'behind a feature flag', meaning: 'được kiểm soát bằng cờ bật/tắt tính năng', usage: 'Giảm rủi ro rollout và cho phép tách deploy khỏi release.' },
      { phrase: 'roll back the release', meaning: 'đưa hệ thống về phiên bản trước', usage: 'Dùng khi version mới gây regression và rollback path đã được chuẩn bị.' },
    ],
    dialogue: [
      { speaker: 'Developer', text: 'The retry abstraction is not ideal, but we need to release on Friday.' },
      { speaker: 'You', text: 'I am comfortable tracking the abstraction as technical debt, provided that the failure path is covered before merge.', note: 'Tách điều có thể hoãn khỏi risk cần xử lý trước release.' },
      { speaker: 'Developer', text: 'Can we reduce rollout risk another way?' },
      { speaker: 'You', text: 'Yes. We can deploy behind a feature flag, enable it for one tenant first, and keep the rollback path verified.', note: 'Dùng vocabulary của progressive delivery để đề xuất kiểm soát cụ thể.' },
    ],
    exercises: [
      {
        prompt: 'Review comment nào tập trung vào code thay vì người viết?',
        options: ['You made this too complex.', 'You clearly forgot the edge cases.', 'This branch leaves retry failure untested; could we cover it before merge?', 'Your approach is wrong.'],
        answer: 2,
        explanation: 'Câu C chỉ ra hành vi thiếu, risk và action mong muốn mà không phán xét năng lực tác giả.',
      },
      {
        prompt: 'Refactor khác functional change ở điểm nào?',
        options: ['Refactor luôn thay API public', 'Refactor thay cấu trúc nhưng giữ hành vi quan sát được', 'Refactor không cần test', 'Refactor chỉ là đổi tên biến'],
        answer: 1,
        explanation: 'Mục tiêu của refactor là cải thiện thiết kế nội bộ trong khi giữ nguyên external behaviour.',
      },
      {
        prompt: 'Triển khai “behind a feature flag” giúp điều gì?',
        options: ['Xóa hoàn toàn nhu cầu test', 'Bật tính năng có kiểm soát và tách deploy khỏi release', 'Tăng test coverage tự động', 'Ngăn mọi production incident'],
        answer: 1,
        explanation: 'Feature flag cho phép code đã deploy nhưng chỉ được bật cho nhóm hoặc thời điểm được chọn; nó giảm chứ không loại bỏ risk.',
      },
      {
        prompt: 'Technical debt được quản lý tốt cần đi kèm điều gì?',
        options: ['Một comment TODO không deadline', 'Tên người đã tạo code', 'Impact, owner và kế hoạch xử lý', 'Cam kết sẽ rewrite toàn hệ thống'],
        answer: 2,
        explanation: 'Debt chỉ quản lý được khi tác động và trách nhiệm được ghi nhận cùng trigger hoặc thời điểm trả nợ.',
      },
    ],
  },
  {
    id: 'disagree-with-tact',
    track: 'meetings',
    eyebrow: 'MEETING INTELLIGENCE · 01',
    title: 'Phản biện mà không đối đầu',
    summary: 'Nêu quan điểm trái chiều rõ ràng, giữ không khí hợp tác trong cuộc họp quốc tế.',
    level: 'C1',
    duration: 18,
    skills: ['Speaking', 'Listening'],
    scenario: 'Bạn không đồng ý với kế hoạch rút ngắn thời gian triển khai, nhưng cần thuyết phục các trưởng nhóm ở ba quốc gia cùng xem lại rủi ro.',
    objectives: [
      'Tách việc phản đối ý tưởng khỏi việc phản đối người nói.',
      'Dùng concession để ghi nhận điểm hợp lý trước khi phản biện.',
      'Đề xuất bước tiếp theo cụ thể thay vì chỉ nêu vấn đề.',
    ],
    principle: {
      title: 'Acknowledge → Reframe → Recommend',
      body: 'Trong môi trường senior, sự lịch sự không có nghĩa là nói vòng vo. Hãy công nhận mục tiêu chung, đổi khung vấn đề bằng dữ kiện, rồi đề xuất một hành động có thể quyết định.',
      before: "I don't think this timeline is realistic.",
      after: 'I see the value in moving quickly. My concern is that the current timeline leaves no room for regulatory review. Could we protect the launch date by validating that workstream first?',
    },
    phrases: [
      { phrase: 'I see the rationale; my reservation is…', meaning: 'Tôi hiểu cơ sở lập luận; điều tôi còn băn khoăn là…', usage: 'Phản biện một lập luận đã có logic, không phủ nhận sạch trơn.' },
      { phrase: 'Could we pressure-test that assumption?', meaning: 'Ta có thể kiểm chứng kỹ giả định đó không?', usage: 'Mời cả nhóm cùng kiểm tra thay vì chỉ đích danh ai sai.' },
      { phrase: 'I would draw a distinction between…', meaning: 'Tôi muốn phân biệt rõ giữa…', usage: 'Chỉnh lại khung tranh luận khi hai khái niệm đang bị gộp.' },
      { phrase: 'What would change your view?', meaning: 'Điều gì có thể khiến anh/chị thay đổi nhận định?', usage: 'Tìm tiêu chí ra quyết định thay vì tranh luận vô tận.' },
    ],
    dialogue: [
      { speaker: 'Elena', text: 'If we cut discovery to one week, we can still launch before the industry event.' },
      { speaker: 'You', text: 'I see the commercial rationale. My reservation is that we would be committing before the French compliance review is complete.', note: 'Ghi nhận mục tiêu kinh doanh trước khi nêu rủi ro.' },
      { speaker: 'Elena', text: 'The review has never delayed us before.' },
      { speaker: 'You', text: 'That is fair. Could we pressure-test that assumption with Legal today, then lock the date tomorrow?', note: 'Biến bất đồng thành một bước xác minh có thời hạn.' },
    ],
    exercises: [
      {
        prompt: 'Câu nào phản biện trực tiếp nhưng vẫn tạo cảm giác hợp tác nhất?',
        options: ['You are overlooking the compliance risk.', 'That will never work in France.', 'I see the rationale; my reservation is the unresolved compliance review.', 'Perhaps the timeline may possibly be a little ambitious.'],
        answer: 2,
        explanation: 'Câu C ghi nhận logic của đề xuất, nêu đúng mối lo và không công kích người đưa ý tưởng. A/B mang tính quy lỗi; D quá mơ hồ.',
      },
      {
        prompt: '“Pressure-test an assumption” gần nghĩa nhất với điều gì?',
        options: ['Gây áp lực để người khác đồng ý', 'Kiểm tra giả định trong điều kiện khắt khe', 'Loại bỏ giả định khỏi cuộc họp', 'Trì hoãn quyết định vô thời hạn'],
        answer: 1,
        explanation: 'Pressure-test là chủ động thử độ vững của một giả định bằng dữ kiện, phản ví dụ hoặc kịch bản khó.',
      },
      {
        prompt: 'Chọn bước kết thúc tốt nhất sau khi đã nêu rủi ro.',
        options: ['Anyway, that is just my opinion.', 'Let us agree to disagree.', 'Could Legal validate this today so we can decide tomorrow?', 'We should discuss this again at some point.'],
        answer: 2,
        explanation: 'Ngôn ngữ senior dẫn tới hành động: rõ người chịu trách nhiệm, việc cần làm và thời điểm quyết định.',
      },
      {
        prompt: 'Câu nào phù hợp nhất khi hai bên đang dùng “speed” với hai nghĩa khác nhau?',
        options: ['You have misunderstood speed.', 'I would draw a distinction between launch speed and decision speed.', 'Speed is not the point.', 'Let me correct your definition.'],
        answer: 1,
        explanation: '“Draw a distinction” giúp làm rõ hai khái niệm mà không đặt người nghe vào thế bị sửa lỗi công khai.',
      },
    ],
  },
  {
    id: 'executive-email',
    track: 'writing',
    eyebrow: 'EXECUTIVE WRITING · 02',
    title: 'Email để lãnh đạo quyết định nhanh',
    summary: 'Viết cập nhật ngắn, có kết luận trước và biến thông tin thành một quyết định rõ ràng.',
    level: 'C1+',
    duration: 20,
    skills: ['Writing', 'Reading'],
    scenario: 'Bạn cần báo cáo cho regional director rằng dự án có hai phương án, mỗi phương án ảnh hưởng khác nhau đến chi phí và ngày ra mắt.',
    objectives: [
      'Đưa decision request lên hai dòng đầu.',
      'Phân biệt fact, implication và recommendation.',
      'Viết subject line cho biết hành động và deadline.',
    ],
    principle: {
      title: 'Bottom line up front (BLUF)',
      body: 'Người đọc cấp cao không nên phải tự rút ra kết luận từ một chuỗi chi tiết. Mở đầu bằng việc cần quyết định, đưa khuyến nghị, sau đó mới cung cấp bằng chứng tối thiểu.',
      before: 'Hi, following our many discussions, I wanted to give you an update on the vendor situation…',
      after: 'Decision needed by Thursday: approve Vendor B to protect the October launch. It costs €18k more but removes the six-week integration risk.',
    },
    phrases: [
      { phrase: 'Decision needed by [date]: …', meaning: 'Cần quyết định trước [ngày]: …', usage: 'Subject line hoặc câu mở đầu khi email có yêu cầu phê duyệt.' },
      { phrase: 'My recommendation is to…', meaning: 'Khuyến nghị của tôi là…', usage: 'Nêu quan điểm có trách nhiệm, tránh đẩy toàn bộ phân tích cho sếp.' },
      { phrase: 'The trade-off is…', meaning: 'Điểm phải đánh đổi là…', usage: 'Tóm tắt chi phí phải chấp nhận để đổi lấy lợi ích.' },
      { phrase: 'Absent any objections, we will…', meaning: 'Nếu không có ý kiến phản đối, chúng tôi sẽ…', usage: 'Chốt bước đi mặc định; chỉ dùng khi bạn có thẩm quyền phù hợp.' },
    ],
    dialogue: [
      { speaker: 'Subject', text: 'Decision by Thu — vendor selection for October launch' },
      { speaker: 'You', text: 'My recommendation is to appoint Vendor B. The trade-off is an additional €18k for a six-week reduction in delivery risk.', note: 'Khuyến nghị và đánh đổi xuất hiện ngay đầu.' },
      { speaker: 'You', text: 'Vendor A: lower cost, unproven integration. Vendor B: higher cost, certified integration and contractual launch support.' },
      { speaker: 'You', text: 'Please reply “approve B” or “discuss” by 16:00 CET Thursday.', note: 'Yêu cầu phản hồi không mơ hồ.' },
    ],
    exercises: [
      {
        prompt: 'Subject line nào hữu ích nhất cho một giám đốc bận rộn?',
        options: ['Vendor update', 'A quick question', 'Decision by Thu — vendor for October launch', 'Important information about our project'],
        answer: 2,
        explanation: 'Subject C cho biết loại hành động, deadline và chủ đề. Các lựa chọn còn lại buộc người đọc mở mail mới hiểu việc cần làm.',
      },
      {
        prompt: 'Câu nào diễn đạt trade-off chính xác?',
        options: ['Vendor B is definitely much better.', 'B costs €18k more but reduces delivery risk by six weeks.', 'There are pros and cons to both vendors.', 'A is cheap, whereas B is expensive.'],
        answer: 1,
        explanation: 'Một trade-off tốt lượng hóa cả cái giá phải trả và giá trị nhận lại; không chỉ đưa nhận xét chung chung.',
      },
      {
        prompt: 'BLUF yêu cầu người viết làm gì?',
        options: ['Bắt đầu bằng toàn bộ bối cảnh lịch sử', 'Dùng nhiều bullet nhất có thể', 'Đưa kết luận hoặc yêu cầu chính lên đầu', 'Lược bỏ mọi dữ kiện hỗ trợ'],
        answer: 2,
        explanation: 'BLUF đưa bottom line lên trước; bằng chứng vẫn cần nhưng nằm sau kết luận và chỉ giữ phần phục vụ quyết định.',
      },
      {
        prompt: 'Lời kết nào tạo ra phản hồi rõ nhất?',
        options: ['Let me know your thoughts.', 'I look forward to hearing from you.', 'Please approve A or B by 16:00 CET Thursday.', 'Do not hesitate to contact me.'],
        answer: 2,
        explanation: 'Câu C định nghĩa đúng hành động, các lựa chọn và deadline; nhờ vậy giảm một vòng trao đổi không cần thiết.',
      },
    ],
  },
  {
    id: 'negotiate-scope',
    track: 'negotiation',
    eyebrow: 'NEGOTIATION · 03',
    title: 'Đàm phán phạm vi, không mặc cả vị thế',
    summary: 'Khám phá lợi ích phía sau yêu cầu và trao đổi điều kiện theo nguyên tắc “if–then”.',
    level: 'C1+',
    duration: 22,
    skills: ['Speaking', 'Listening'],
    scenario: 'Một stakeholder muốn thêm tính năng nhưng không chấp nhận lùi ngày giao. Bạn cần bảo vệ năng lực đội mà vẫn giữ quan hệ.',
    objectives: [
      'Chuyển từ position sang underlying interest.',
      'Không nhượng bộ đơn phương; luôn gắn điều kiện trao đổi.',
      'Tóm tắt thỏa thuận bằng ngôn ngữ kiểm chứng được.',
    ],
    principle: {
      title: 'Trade, do not concede',
      body: 'Một nhượng bộ miễn phí nhanh chóng trở thành kỳ vọng mới. Hãy tìm ưu tiên thật sự rồi đề nghị trao đổi: nếu phạm vi tăng thì thời gian, nguồn lực hoặc tiêu chuẩn khác phải thay đổi.',
      before: 'Fine, we will try to add it without moving the date.',
      after: 'If the audit dashboard is essential for launch, we can include it provided that the export module moves to phase two.',
    },
    phrases: [
      { phrase: 'What is driving that requirement?', meaning: 'Điều gì đang thúc đẩy yêu cầu đó?', usage: 'Tìm lợi ích hoặc ràng buộc phía sau một lập trường cứng.' },
      { phrase: 'If we were to…, we would need…', meaning: 'Nếu chúng tôi làm…, chúng tôi sẽ cần…', usage: 'Đưa điều kiện trước khi cam kết.' },
      { phrase: 'I can move on X, provided that…', meaning: 'Tôi có thể linh hoạt về X, với điều kiện…', usage: 'Báo hiệu thiện chí nhưng bảo toàn một trao đổi tương xứng.' },
      { phrase: 'Let me play back what we have agreed.', meaning: 'Để tôi nhắc lại điều ta đã thống nhất.', usage: 'Kiểm tra hai bên có cùng hiểu cam kết hay không.' },
    ],
    dialogue: [
      { speaker: 'Stakeholder', text: 'The audit dashboard has to be in the September release.' },
      { speaker: 'You', text: 'What is driving the September requirement?', note: 'Hỏi về động lực thay vì phản bác deadline.' },
      { speaker: 'Stakeholder', text: 'Our regulator reviews the product in October; export can wait.' },
      { speaker: 'You', text: 'Understood. We can bring the dashboard forward, provided that export moves to phase two. Let me play back the revised scope before we close.', note: 'Trao đổi hai hạng mục rồi xác nhận lại.' },
    ],
    exercises: [
      {
        prompt: 'Câu hỏi nào khám phá “interest” thay vì tranh luận “position”?',
        options: ['Why is your deadline so unrealistic?', 'What is driving the September requirement?', 'Can you accept October instead?', 'Who promised you that date?'],
        answer: 1,
        explanation: 'B hỏi về nhu cầu phía sau mốc thời gian. Khi biết lý do là kỳ kiểm tra, hai bên có thể đổi ưu tiên tính năng.',
      },
      {
        prompt: 'Câu nào là một conditional trade hoàn chỉnh?',
        options: ['We will try our best to include both.', 'We can include the dashboard if export moves to phase two.', 'Maybe we can do something.', 'The team cannot take more work.'],
        answer: 1,
        explanation: 'Cấu trúc if–then nối rõ điều bên kia nhận được với điều kiện bạn cần, tránh lời hứa mơ hồ.',
      },
      {
        prompt: '“Provided that” thể hiện sắc thái nào?',
        options: ['Một nguyên nhân trong quá khứ', 'Một điều kiện bắt buộc cho cam kết', 'Một lời xin lỗi trang trọng', 'Một dự đoán thiếu chắc chắn'],
        answer: 1,
        explanation: '“Provided that” tương đương “on condition that”, phù hợp để nêu điều kiện thương lượng rõ nhưng chuyên nghiệp.',
      },
      {
        prompt: 'Vì sao nên “play back” thỏa thuận ở cuối?',
        options: ['Để thể hiện vốn từ', 'Để kéo dài cuộc họp', 'Để phát hiện khác biệt trong cách hiểu trước khi hành động', 'Để thay thế biên bản bằng trí nhớ'],
        answer: 2,
        explanation: 'Nhắc lại scope, owner và deadline giúp sửa bất đồng ngay tại chỗ; sau đó vẫn nên ghi nhận bằng văn bản.',
      },
    ],
  },
  {
    id: 'present-with-impact',
    track: 'presenting',
    eyebrow: 'PRESENTATION · 04',
    title: 'Trình bày dữ liệu thành thông điệp',
    summary: 'Dẫn người nghe từ phát hiện đến hàm ý và hành động, thay vì đọc lại biểu đồ.',
    level: 'C1',
    duration: 19,
    skills: ['Speaking', 'Reading'],
    scenario: 'Bạn có 5 phút trước ban điều hành để giải thích vì sao doanh thu tăng nhưng biên lợi nhuận giảm.',
    objectives: [
      'Mở đầu slide bằng takeaway, không bằng mô tả hình học.',
      'Dùng signposting để điều khiển sự chú ý.',
      'Phân biệt correlation với nguyên nhân đã được chứng minh.',
    ],
    principle: {
      title: 'What? → So what? → Now what?',
      body: 'Dữ liệu chỉ có giá trị khi người nghe hiểu điều gì đã xảy ra, vì sao nó quan trọng và cần làm gì tiếp theo. Mỗi slide quan trọng nên trả lời đủ ba câu này.',
      before: 'As you can see, the blue line goes up and the orange line goes down.',
      after: 'Revenue grew 12%, but margin fell three points as the mix shifted to lower-value contracts. We should pause the current discount scheme pending a cohort review.',
    },
    phrases: [
      { phrase: 'The headline here is…', meaning: 'Thông điệp chính ở đây là…', usage: 'Hướng sự chú ý vào kết luận quan trọng nhất trên slide.' },
      { phrase: 'What this means in practice is…', meaning: 'Trong thực tế, điều này có nghĩa là…', usage: 'Nối dữ liệu với tác động vận hành hoặc thương mại.' },
      { phrase: 'The data suggests, but does not prove…', meaning: 'Dữ liệu gợi ý, nhưng chưa chứng minh rằng…', usage: 'Giữ độ chính xác khi chưa xác lập quan hệ nhân quả.' },
      { phrase: 'I will come back to that in a moment.', meaning: 'Tôi sẽ quay lại điểm đó ngay sau đây.', usage: 'Giữ cấu trúc khi bị hỏi sớm một nội dung sắp trình bày.' },
    ],
    dialogue: [
      { speaker: 'You', text: 'The headline here is that growth is coming at the expense of margin.' },
      { speaker: 'You', text: 'Revenue rose 12%, while margin fell from 31% to 28%. The data suggests, but does not yet prove, that discounting changed our customer mix.', note: 'Nêu số liệu và giới hạn của kết luận.' },
      { speaker: 'CFO', text: 'Are you recommending that we stop all discounts?' },
      { speaker: 'You', text: 'Not across the board. I recommend a two-week cohort review before renewing the scheme.', note: 'Khuyến nghị cân xứng với mức độ chắc chắn của dữ liệu.' },
    ],
    exercises: [
      {
        prompt: 'Câu mở đầu slide nào có giá trị nhất?',
        options: ['This chart has two lines.', 'Let me walk you through the numbers.', 'Growth is coming at the expense of margin.', 'You can all see the trend here.'],
        answer: 2,
        explanation: 'Một slide headline nên là kết luận có ý nghĩa, không phải lời mô tả cách đọc biểu đồ.',
      },
      {
        prompt: 'Khi chưa chứng minh được nguyên nhân, động từ nào phù hợp nhất?',
        options: ['proves', 'guarantees', 'suggests', 'establishes'],
        answer: 2,
        explanation: '“Suggests” thể hiện bằng chứng định hướng nhưng chưa đủ xác lập quan hệ nhân quả, tránh overclaim.',
      },
      {
        prompt: '“So what?” trong cấu trúc trình bày yêu cầu điều gì?',
        options: ['Đọc con số lớn nhất', 'Giải thích vì sao phát hiện có ý nghĩa', 'Chuyển sang slide kế tiếp', 'Nhắc lại toàn bộ phương pháp'],
        answer: 1,
        explanation: '“So what?” chuyển một quan sát thành tác động đối với mục tiêu, rủi ro hoặc quyết định của người nghe.',
      },
      {
        prompt: 'Câu nào xử lý tốt một câu hỏi đến quá sớm?',
        options: ['Please do not interrupt.', 'That question is irrelevant.', 'I will come back to that in a moment when we look at the cohort data.', 'I do not have time for questions.'],
        answer: 2,
        explanation: 'Câu C ghi nhận câu hỏi, cho biết chính xác khi nào nó được trả lời và giữ mạch trình bày.',
      },
    ],
  },
  {
    id: 'high-stakes-update',
    track: 'meetings',
    eyebrow: 'STAKEHOLDER MANAGEMENT · 05',
    title: 'Báo tin xấu mà vẫn giữ niềm tin',
    summary: 'Thông báo chậm tiến độ bằng sự minh bạch, quyền sở hữu và kế hoạch phục hồi đáng tin cậy.',
    level: 'C2',
    duration: 24,
    skills: ['Speaking', 'Writing'],
    scenario: 'Một lỗi tích hợp khiến ngày pilot có nguy cơ trễ hai tuần. Bạn phải cập nhật cho sponsor trước khi họ nghe từ nguồn khác.',
    objectives: [
      'Nêu sự thật và mức độ chắc chắn mà không che giấu.',
      'Nhận trách nhiệm cho phần thuộc quyền kiểm soát.',
      'Đưa recovery plan, trigger và lần cập nhật tiếp theo.',
    ],
    principle: {
      title: 'Fact → Impact → Ownership → Recovery',
      body: 'Niềm tin giảm mạnh nhất không phải khi có vấn đề, mà khi stakeholder cảm thấy thông tin bị trì hoãn hoặc tô hồng. Hãy nói điều đã biết, điều chưa biết, tác động và cách bạn kiểm soát bước tiếp theo.',
      before: 'There have been some minor technical challenges, but the team is working hard.',
      after: 'The integration test failed yesterday. The pilot is now at risk of a two-week delay. I approved the dependency without a full load test; that is on me. We will confirm the recovery path by 14:00 Friday.',
    },
    phrases: [
      { phrase: 'The date is at risk; it has not yet moved.', meaning: 'Mốc thời gian đang có rủi ro; chưa chính thức thay đổi.', usage: 'Phân biệt nguy cơ với kết quả đã chắc chắn.' },
      { phrase: 'Here is what we know / do not yet know.', meaning: 'Đây là điều ta đã biết / chưa biết.', usage: 'Quản lý bất định mà không suy đoán.' },
      { phrase: 'That decision sits with me.', meaning: 'Quyết định đó thuộc trách nhiệm của tôi.', usage: 'Nhận ownership cá nhân mà không đổ lỗi cho đội.' },
      { phrase: 'Our next decision point is…', meaning: 'Mốc quyết định tiếp theo của chúng ta là…', usage: 'Cho stakeholder biết khi nào có đủ dữ kiện để hành động.' },
    ],
    dialogue: [
      { speaker: 'You', text: 'I want to flag a material risk early. Yesterday’s integration test failed, so the pilot date is at risk; it has not yet moved.' },
      { speaker: 'Sponsor', text: 'How did we miss this?' },
      { speaker: 'You', text: 'I approved the dependency before the full load test. That decision sits with me.', note: 'Ownership ngắn gọn, không thêm lời bào chữa.' },
      { speaker: 'You', text: 'Two engineers are testing the fallback today. Our next decision point is 14:00 Friday, when I will confirm either the original date or a two-week reset.', note: 'Recovery plan có người, hành động và trigger.' },
    ],
    exercises: [
      {
        prompt: 'Câu nào phân biệt đúng risk với confirmed delay?',
        options: ['The launch will probably be fine.', 'The launch has failed.', 'The date is at risk; it has not yet moved.', 'We may or may not have some delay.'],
        answer: 2,
        explanation: 'Câu C minh bạch về nguy cơ nhưng không trình bày dự đoán như một sự kiện đã chắc chắn.',
      },
      {
        prompt: 'Cách nhận trách nhiệm nào tạo niềm tin nhất?',
        options: ['The engineers should have caught it.', 'Mistakes were made.', 'That approval decision sits with me.', 'The vendor caused the issue.'],
        answer: 2,
        explanation: 'Câu C chỉ rõ quyết định thuộc phạm vi của người nói. Passive voice hoặc đổ lỗi làm ownership yếu đi.',
      },
      {
        prompt: 'Một recovery update đáng tin cần có gì?',
        options: ['Lời hứa đội sẽ cố hết sức', 'Một mốc cập nhật và tiêu chí quyết định cụ thể', 'Nhiều chi tiết kỹ thuật nhất có thể', 'Cam kết không còn rủi ro'],
        answer: 1,
        explanation: 'Khi kết quả còn bất định, hãy cam kết về quy trình kiểm soát: ai làm gì, đến khi nào và dữ kiện nào kích hoạt quyết định.',
      },
      {
        prompt: 'Cụm nào dễ làm stakeholder mất niềm tin nhất?',
        options: ['a material risk', 'what we do not yet know', 'some minor technical challenges', 'our next decision point'],
        answer: 2,
        explanation: '“Some minor challenges” tô nhẹ một vấn đề có thể trễ hai tuần; sự lệch giữa ngôn ngữ và tác động tạo cảm giác che giấu.',
      },
    ],
  },
  {
    id: 'cross-cultural-clarity',
    track: 'collaboration',
    eyebrow: 'EUROPEAN COLLABORATION · 06',
    title: 'Rõ ràng trong đội ngũ đa văn hóa',
    summary: 'Giảm hiểu nhầm khi mức độ trực tiếp, quyền quyết định và kỳ vọng phản hồi khác nhau.',
    level: 'C1+',
    duration: 21,
    skills: ['Listening', 'Speaking', 'Writing'],
    scenario: 'Sau cuộc họp giữa các nhóm Đức, Hà Lan, Pháp và Việt Nam, mọi người đều đồng ý về hướng đi nhưng lại hiểu khác nhau về ai có quyền quyết định cuối.',
    objectives: [
      'Không gán hành vi cho khuôn mẫu quốc gia.',
      'Làm rõ decision owner, contributor và deadline.',
      'Kiểm tra sự đồng thuận thật thay vì dựa vào im lặng.',
    ],
    principle: {
      title: 'Make the implicit explicit',
      body: 'Trong nhóm đa văn hóa, “yes”, sự im lặng hoặc một đề xuất trực tiếp có thể mang ý nghĩa khác nhau. Đừng đoán ý định; hãy làm rõ quy trình, tiêu chí và quyền quyết định bằng ngôn ngữ trung tính.',
      before: 'Everyone agreed, so I assumed we could start.',
      after: 'Before we close: Marta owns the decision, each country lead will flag legal constraints by Tuesday, and silence after Wednesday means no further objection—not formal approval.',
    },
    phrases: [
      { phrase: 'How should we interpret agreement today?', meaning: 'Ta nên hiểu sự đồng thuận hôm nay ở mức nào?', usage: 'Phân biệt đồng ý hướng đi, đồng ý đề xuất và phê duyệt chính thức.' },
      { phrase: 'Who has the final decision right?', meaning: 'Ai có quyền quyết định cuối cùng?', usage: 'Làm rõ governance mà không tranh giành thẩm quyền.' },
      { phrase: 'I would like to hear from those we have not heard from yet.', meaning: 'Tôi muốn nghe thêm từ những người chưa lên tiếng.', usage: 'Mời đóng góp mà không gây áp lực gọi tên cá nhân.' },
      { phrase: 'Let us define what “done” means here.', meaning: 'Hãy thống nhất “hoàn tất” nghĩa là gì trong việc này.', usage: 'Làm rõ tiêu chí nghiệm thu giữa các đội.' },
    ],
    dialogue: [
      { speaker: 'Facilitator', text: 'It sounds as though we support the direction. How should we interpret agreement today: endorsement or formal approval?' },
      { speaker: 'Marta', text: 'Endorsement. I have the final decision right after local legal review.' },
      { speaker: 'You', text: 'Then each country lead will flag constraints by Tuesday, and Marta will decide on Thursday. Is that an accurate summary?', note: 'Chuyển đồng thuận chung thành governance cụ thể.' },
      { speaker: 'Facilitator', text: 'Before we close, I would like to hear from those we have not heard from yet.', note: 'Tạo không gian cho ý kiến chưa được nói ra.' },
    ],
    exercises: [
      {
        prompt: 'Câu nào kiểm tra đúng mức độ đồng thuận?',
        options: ['Everyone is silent, so we all agree.', 'How should we interpret agreement today: endorsement or formal approval?', 'Does anybody disagree with me?', 'We have consensus and can move on.'],
        answer: 1,
        explanation: 'Câu B đưa ra hai mức cam kết cụ thể để nhóm xác nhận; im lặng không tự động là phê duyệt.',
      },
      {
        prompt: 'Cách nào tránh khuôn mẫu văn hóa tốt nhất?',
        options: ['The Dutch are always direct.', 'Asian colleagues rarely disagree openly.', 'Different teams may signal disagreement differently; let us ask each lead explicitly.', 'French meetings are usually theoretical.'],
        answer: 2,
        explanation: 'Câu C thừa nhận khác biệt có thể tồn tại nhưng chuyển trọng tâm sang một quy trình kiểm tra áp dụng cho từng cá nhân.',
      },
      {
        prompt: '“Decision right” nói về điều gì?',
        options: ['Quyền phát biểu đầu tiên', 'Quyền đưa ra quyết định cuối cùng', 'Quyền không dự họp', 'Quyền viết biên bản'],
        answer: 1,
        explanation: 'Decision right là thẩm quyền quyết định, khác với việc đóng góp ý kiến, tư vấn hay thực thi.',
      },
      {
        prompt: 'Tóm tắt cuối họp nào rõ nhất?',
        options: ['We all know what to do.', 'Let us keep the momentum going.', 'Country leads flag constraints by Tuesday; Marta decides Thursday.', 'Please follow up as appropriate.'],
        answer: 2,
        explanation: 'Câu C xác định owner, hành động và thời điểm; nó có thể được kiểm chứng sau cuộc họp.',
      },
    ],
  },
];
